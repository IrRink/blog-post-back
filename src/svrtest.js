const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const static = require('serve-static');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dbconfig = require('../dbconfig/dbconfig.json');
require('dotenv').config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/public', static(path.join(__dirname, 'public')));

const corsOptions = {
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500'],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
};
app.use(cors(corsOptions));

// MySQL 연결 풀 생성
const pool = mysql.createPool({
    connectionLimit: 10,
    host: dbconfig.host,
    user: dbconfig.user,
    password: dbconfig.password,
    database: dbconfig.database,
    debug: false
});

// JWT 생성 함수
const generateToken = (user) => {
    return jwt.sign(user, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1d' });
};

// 로그인 처리
app.post('/process/login/:role?', async (req, res) => {
    const paramId = req.body.userId;
    const paramPassword = req.body.password;
    const role = req.params.role;

    pool.getConnection((err, conn) => {
        if (err) {
            return res.status(500).json({ message: 'SQL 연결 실패' });
        }

        const sql = role === 'admin' 
            ? 'SELECT id, name, password FROM admin WHERE id = ?' 
            : 'SELECT id, name, age, password FROM users WHERE id = ?';

        conn.query(sql, [paramId], async (err, rows) => {
            conn.release();

            if (err) {
                return res.status(500).json({ message: 'SQL 실행 실패' });
            }

            if (rows.length > 0) {
                const user = rows[0];
                const isPasswordValid = await bcrypt.compare(paramPassword, user.password);

                if (isPasswordValid) {
                    const token = generateToken({ id: user.id, name: user.name, isAdmin: role === 'admin' });
                    return res.json({ token, userName: user.name }); // 정상 응답
                } else {
                    return res.status(401).json({ message: '로그인 정보가 올바르지 않습니다.' });
                }
            } else {
                return res.status(401).json({ message: '로그인 정보가 올바르지 않습니다.' });
            }
        });
    });
});


// 토큰 검증 미들웨어
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// 세션 확인 라우트 추가
app.get('/session', authenticateToken, (req, res) => {
    res.json(req.user);
});

// 로그아웃 엔드포인트 (토큰 삭제로 구현)
app.post('/process/logout', (req, res) => {
    res.send('로그아웃 되었습니다.'); // 실제로는 클라이언트에서 토큰을 삭제해야 함
});

// 아이디 중복 체크
app.get('/process/checkid/:userId', (req, res) => {
    const userId = req.params.userId;

    pool.getConnection((err, conn) => {
        if (err) {
            return res.status(500).json({ message: 'SQL 연결 실패' });
        }

        const sql = 'SELECT COUNT(*) AS count FROM users WHERE id = ?';
        conn.query(sql, [userId], (err, rows) => {
            conn.release();

            if (err) {
                return res.status(500).json({ message: 'SQL 실행 실패' });
            }

            const count = rows[0].count;
            if (count > 0) {
                return res.status(409).json({ message: '이미 사용 중인 아이디입니다.' });
            } else {
                return res.status(200).json({ message: '사용 가능한 아이디입니다.' });
            }
        });
    });
});

// 사용자 및 관리자 추가
app.post('/process/adduseroradmin', async (req, res) => {
    const { userId, name, password, age } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO admin (id, name, password, age) VALUES (?, ?, ?, ?)';
    
    pool.getConnection((err, conn) => {
        if (err) {
            return res.status(500).json({ message: 'SQL 연결 실패' });
        }

        conn.query(sql, [userId, name, hashedPassword, age], (err, result) => {
            conn.release();

            if (err) {
                return res.status(500).json({ message: '관리자가 이미 존재합니다.' });
            }
            return res.json({ message: '관리자 등록이 완료되었습니다.' });
        });
    });
});

// 사용자 추가
app.post('/process/adduseroruser', async (req, res) => {
    const { userId, name, age, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (id, name, age, password) VALUES (?, ?, ?, ?)';

    pool.getConnection((err, conn) => {
        if (err) {
            return res.status(500).json({ message: 'SQL 연결 실패' });
        }

        conn.query(sql, [userId, name, age, hashedPassword], (err, result) => {
            conn.release();

            if (err) {
                return res.status(500).json({ message: "동일한 아이디가 존재합니다." });
            }
            return res.json({ message: "회원가입이 완료되었습니다." });
        });
    });
});

// 관리자 정보와 회원 수를 가져오는 API
app.get('/process/adminAndUserCount', (req, res) => {
    const sqlAdmin = 'SELECT admin_date FROM admin LIMIT 1';
    const sqlUserCount = 'SELECT COUNT(*) AS userCount FROM users';

    pool.getConnection((err, conn) => {
        if (err) {
            return res.status(500).send('<h1>SQL 연결 실패</h1>');
        }

        conn.query(sqlAdmin, (err, adminRows) => {
            if (err) {
                conn.release();
                return res.status(500).send('<h1>SQL 실행 실패</h1>');
            }

            conn.query(sqlUserCount, (err, userCountRows) => {
                conn.release();

                if (err) {
                    return res.status(500).send('<h1>SQL 실행 실패</h1>');
                }

                const adminDate = adminRows.length > 0 ? adminRows[0].admin_date : null;
                const userCount = userCountRows[0].userCount;

                res.json({
                    admin_date: adminDate,
                    userCount: userCount
                });
            });
        });
    });
});

// 어드민 이름을 가져오는 API
app.get('/process/admin-name', (req, res) => {
    pool.getConnection((err, conn) => {
        if (err) {
            return res.status(500).json({ message: 'SQL 연결 실패' });
        }

        const sql = 'SELECT name FROM admin LIMIT 1';
        conn.query(sql, (err, rows) => {
            conn.release();

            if (err) {
                return res.status(500).json({ message: 'SQL 실행 실패' });
            }

            const adminName = rows.length > 0 ? rows[0].name : null;
            res.json({ adminName });
        });
    });
});

// 포트 설정
const PORT = 5500;
app.listen(PORT, () => {
    console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});
