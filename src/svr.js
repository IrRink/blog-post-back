const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const static = require('serve-static');
const bcrypt = require('bcrypt');
const session = require('express-session');
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

// 세션 미들웨어 설정
app.use(session({
    key: 'session_cookie_name',
    secret: process.env.SESSION_SECRET || '0930',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 쿠키 유효 기간 (예: 1일)
    }
}));

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
                    req.session.userId = user.id;
                    req.session.userName = user.name;
                    if (role === 'admin') {
                        req.session.isAdmin = true;
                    } else {
                        req.session.userAge = user.age;
                    }

                    req.session.save(err => {
                        if (err) {
                            return res.status(500).json({ message: '세션 저장 실패' });
                        }
                        // 로그인 성공 시 사용자 이름만 반환
                        return res.send(req.session.userName); // 사용자 이름만 반환
                    });
                } else {
                    return res.status(401).json('로그인 정보가 올바르지 않습니다.');
                }
            } else {
                return res.status(401).json('로그인 정보가 올바르지 않습니다.' );
            }
        });
    });
});



// 세션 확인 API
app.get('/process/check-session', (req, res) => {
    if (req.session.userId) {
        res.json({
            message: '세션이 존재합니다.',
            userId: req.session.userId,
            userName: req.session.userName,
            userAge: req.session.userAge,
            isAdmin: req.session.isAdmin || false
        });
    } else {
        res.status(401).json({ message: '로그인이 필요합니다.' });
    }
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
    const { userId, name, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO admin (id, name, password) VALUES (?, ?, ?)';
    
    pool.getConnection((err, conn) => {
        if (err) {
            return res.status(500).json({ message: 'SQL 연결 실패' });
        }

        conn.query(sql, [userId, name, hashedPassword], (err, result) => {
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

        const sql = 'SELECT name FROM admin LIMIT 1'; // 첫 번째 어드민의 이름을 가져옴

        conn.query(sql, (err, rows) => {
            conn.release();

            if (err) {
                return res.status(500).json({ message: 'SQL 실행 실패' });
            }

            if (rows.length > 0) {
                // 어드민 이름만 반환
                return res.json(rows[0].name);
            } else {
                return res.status(404).json({ message: '어드민이 존재하지 않습니다.' });
            }
        });
    });
});


// 사용자 정보 수정
app.put('/process/editMyInfo', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const { userName, userAge } = req.body;

    const sql = 'UPDATE users SET name = ?, age = ? WHERE id = ?';
    pool.getConnection((err, conn) => {
        if (err) {
            return res.status(500).json({ message: 'SQL 연결 실패' });
        }

        conn.query(sql, [userName, userAge, req.session.userId], (err, result) => {
            conn.release();

            if (err) {
                return res.status(500).json({ message: 'SQL 실행 실패' });
            }

            return res.json({ message: '사용자 정보가 수정되었습니다.' });
        });
    });
});

app.listen(5500, () => {
    console.log('서버가 포트 5500에서 시작되었습니다.');
});
