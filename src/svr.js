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
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://lacalhost:5500'],
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
    debug: false,
});

// 세션 미들웨어 설정
app.use(session({
    name: 'user',
    secret: process.env.SESSION_SECRET || '0930',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 86400000, // 1일
        secure: false,
        sameSite: 'lax',
        httpOnly: true,
        path: '/',
        domain: 'localhost'
    }
}));

// 로그인
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

                    console.log('세션 저장 전:', req.session);

                    req.session.save((err) => {
                        if (err) {
                            console.log('세션 저장 중 오류 발생:', err);
                            return res.status(500).json({ message: '세션 저장 오류' });
                        }

                        console.log('로그인 후 세션 ID:', req.sessionID);
                        console.log('로그인 후 세션 데이터:', req.session);
                        return res.json({
                            message: '로그인 성공',
                            userName: req.session.userName,
                            userId: req.session.userId
                        });
                    });

                } else {
                    return res.status(401).json({ message: '로그인 정보가 올바르지 않습니다.' });
                }
            } else {
                return res.status(401).json({ message: '로그인 정보가 올바르지 않습니다.' });
            }
        });
    });
});

// 세션 데이터 확인 API
app.get('/session', validateSession, (req, res) => {
    console.log('현재 세션:', req.session);
    res.json({
        message: '세션이 유효합니다.',
        userId: req.session.userId,
        userName: req.session.userName,
    });
});

// 로그아웃
app.post('/logout', (req, res) => {
    console.log('로그아웃 요청 전 세션:', req.session); // 로그아웃 요청 시 세션 정보 출력
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: '로그아웃 실패' });
        }
        res.clearCookie('user'); // 쿠키 삭제
        res.json({ message: '로그아웃 성공' });
    });
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
    const sqlCheckAdmin = 'SELECT COUNT(*) AS count FROM admin';
    const sqlInsertAdmin = 'INSERT INTO admin (id, name, password, age) VALUES (?, ?, ?, ?)';

    pool.getConnection((err, conn) => {
        if (err) {
            return res.status(500).json({ message: 'SQL 연결 실패' });
        }

        // 현재 등록된 관리자의 수를 확인
        conn.query(sqlCheckAdmin, (err, results) => {
            if (err) {
                conn.release();
                return res.status(500).json({ message: '관리자 수 확인 실패' });
            }

            const adminCount = results[0].count;

            // 이미 한 명의 관리자가 등록되어 있다면 추가 등록을 막음
            if (adminCount >= 1) {
                conn.release();
                return res.status(400).json({ message: '관리자는 이미 등록되어 있습니다.' });
            }

            // 관리자가 없는 경우 새로운 관리자 추가
            conn.query(sqlInsertAdmin, [userId, name, hashedPassword, age], (err, result) => {
                conn.release();

                if (err) {
                    return res.status(500).json({ message: '관리자 등록에 실패했습니다.' });
                }
                return res.json({ message: '관리자 등록이 완료되었습니다.' });
            });
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

// 사용자 세션 검증 미들웨어
function validateSession(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ message: '로그인 필요' });
    }
    next();
}

// 사용자 정보 수정 처리
app.post('/process/updateUser', validateSession, async (req, res) => {
    const userId = req.session.userId;
    const { name, age, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'UPDATE users SET name = ?, age = ?, password = ? WHERE id = ?';

    pool.getConnection((err, conn) => {
        if (err) {
            return res.status(500).json({ message: 'SQL 연결 실패' });
        }

        conn.query(sql, [name, age, hashedPassword, userId], (err, result) => {
            conn.release();

            if (err) {
                return res.status(500).json({ message: '정보 수정 실패' });
            }
            return res.json({ message: '정보 수정 완료' });
        });
    });
});

// 서버 실행
const port = 5500;
app.listen(port, () => {
    console.log(`서버가 ${port}번 포트에서 실행 중입니다.`);
});
