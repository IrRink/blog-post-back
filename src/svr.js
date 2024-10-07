const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const static = require('serve-static');
const bcrypt = require('bcrypt');
const session = require('express-session');
const cors = require('cors');
const dbconfig = require('../dbconfig/dbconfig.json');
require('dotenv').config();

const pool = mysql.createPool({
    connectionLimit: 10,
    host: dbconfig.host,
    user: dbconfig.user,
    password: dbconfig.password,
    database: dbconfig.database,
    debug: false
});

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/public', static(path.join(__dirname, 'public')));

const corsOptions = {
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500'], // 허용할 출처를 배열로 나열
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
};
app.use(cors(corsOptions));

// 세션 설정
app.use(session({
    secret: '0930', // 세션 암호화 키
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // https 사용 시 true로 변경
}));

app.get('/process/session', (req, res) => {
    if (req.session.userId) {
        res.json({
            userId: req.session.userId,
            userName: req.session.userName,
            userAge: req.session.userAge
        });
    } else {
        res.status(401).json({ message: '세션 정보가 없습니다.' });
    }
});



app.use(session({
    secret: process.env.SESSION_SECRET || '0930',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.get('/process/session', (req, res) => {
    if (req.session.userId) {
        res.json({
            userId: req.session.userId,
            userName: req.session.userName,
            userAge: req.session.userAge
        });
    } else {
        res.status(401).send('세션이 없습니다. 로그인해주세요.');
    }
});

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
            conn.release(); // 연결 해제는 항상 수행

            if (err) {
                console.error('SQL 실행 실패:', err); // SQL 실행 오류 로그 추가
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

                    console.log('세션 저장 전:', req.session); // 세션 저장 전 로그

                    // 세션 저장
                    req.session.save((err) => {
                        if (err) {
                            console.error('세션 저장 중 오류:', err); // 세션 저장 오류 로그 추가
                            return res.status(500).json({ message: '세션 저장 실패' });
                        }
                        console.log('세션 저장 후:', req.session); // 세션 저장 후 로그
                        return res.json({ message: `${user.name}님, 환영합니다!` });
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


// 아이디 중복 확인 처리
app.get('/process/check-id', (req, res) => {
    const userId = req.query.userId;

    pool.getConnection((err, conn) => {
        if (err) {
            console.log('Mysql getConnection error. aborted');
            return res.status(500).send({ message: 'SQL 연결 실패' });
        }

        const sql = 'SELECT COUNT(*) AS count FROM users WHERE id = ?';
        conn.query(sql, [userId], (err, results) => {
            conn.release(); // 연결 반환

            if (err) {
                console.log('SQL 실행 중 오류 발생:', err);
                return res.status(500).send({ message: 'SQL 실행 실패' });
            }

            const count = results[0].count;
            if (count > 0) {
                // 아이디가 이미 존재함
                res.send({ message: '이미 사용 중인 아이디입니다.' });
            } else {
                // 아이디 사용 가능
                res.send({ message: '사용 가능한 아이디입니다.' });
            }
        });
    });
});

// 사용자 추가 처리 (회원가입)
app.post('/process/adduser', async (req, res) => {
    const { id, name, age, password } = req.body; // 클라이언트로부터 받은 데이터

    try {
        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        pool.getConnection((err, conn) => {
            if (err) {
                console.log('Mysql getConnection error. aborted');
                return res.status(500).send('<h1>SQL 연결 실패</h1>');
            }

            // 사용자 정보를 데이터베이스에 삽입
            const sql = 'INSERT INTO users(id, name, age, password) VALUES(?, ?, ?, ?)';
            conn.query(sql, [id, name, age, hashedPassword], (err, result) => {
                conn.release(); // 연결 반환

                if (err) {
                    console.log('SQL 실행 중 오류 발생:', err);
                    return res.status(500).send('<h1>SQL 실행 실패</h1>');
                }

                console.log('사용자 추가 성공');
                // 회원가입 성공 후 메시지 제공
                res.send(`
                    회원가입 성공
                `); // 성공 메시지 반환
            });
        });
    } catch (error) {
        console.log('비밀번호 해싱 중 오류 발생:', error);
        res.status(500).send('<h1>비밀번호 해싱 실패</h1>'); // 오류 메시지 반환
    }
});

// 관리자 추가 처리 (회원가입)
app.post('/process/addadmin', async (req, res) => {
    const { id, name, age, password } = req.body; // 클라이언트로부터 받은 데이터

    try {
        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        pool.getConnection((err, conn) => {
            if (err) {
                console.log('Mysql getConnection error. aborted');
                return res.status(500).send('<h1>SQL 연결 실패</h1>');
            }

            // admin 테이블의 데이터 수를 확인
            const checkAdminSql = 'SELECT COUNT(*) AS count FROM admin';
            conn.query(checkAdminSql, (err, results) => {
                if (err) {
                    console.log('SQL 실행 중 오류 발생:', err);
                    conn.release();
                    return res.status(500).send('<h1>SQL 실행 실패</h1>');
                }

                const adminCount = results[0].count;

                if (adminCount === 0) {
                    // admin 테이블이 비어있다면 사용자 추가
                    const sql = 'INSERT INTO admin(id, name, age, password) VALUES(?, ?, ?, ?)';
                    conn.query(sql, [id, name, age, hashedPassword], (err, result) => {
                        conn.release(); // 연결 반환

                        if (err) {
                            console.log('SQL 실행 중 오류 발생:', err);
                            return res.status(500).send('<h1>SQL 실행 실패</h1>');
                        }

                        console.log('관리자 추가 성공');
                        // 회원가입 성공 후 메시지 제공
                        res.send(`
                            관리자 추가 성공
                        `); // 성공 메시지 반환
                    });
                } else {
                    // admin 테이블에 데이터가 이미 존재하는 경우
                    conn.release(); // 연결 반환
                    return res.status(400).send('<h1>이미 관리자 계정이 존재합니다</h1>');
                }
            });
        });
    } catch (error) {
        console.log('비밀번호 해싱 중 오류 발생:', error);
        res.status(500).send('<h1>비밀번호 해싱 실패</h1>'); // 오류 메시지 반환
    }
});

// 관리자 정보와 회원 수를 가져오는 API
app.get('/process/adminAndUserCount', (req, res) => {
    const sqlAdmin = 'SELECT admin_date FROM admin LIMIT 1'; // 첫 번째 관리자만 가져오기
    const sqlUserCount = 'SELECT COUNT(*) AS userCount FROM users';

    pool.getConnection((err, conn) => {
        if (err) {
            console.log('Mysql getConnection error. aborted');
            return res.status(500).send('<h1>SQL 연결 실패</h1>');
        }

        conn.query(sqlAdmin, (err, adminRows) => {
            if (err) {
                conn.release();
                console.log('SQL 실행 중 오류 발생:', err);
                return res.status(500).send('<h1>SQL 실행 실패</h1>');
            }

            conn.query(sqlUserCount, (err, userCountRows) => {
                conn.release(); // 연결 반환

                if (err) {
                    console.log('SQL 실행 중 오류 발생:', err);
                    return res.status(500).send('<h1>SQL 실행 실패</h1>');
                }

                // 첫 번째 관리자 가입 날짜와 총 회원 수 응답
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


// 사용자 정보를 가져오는 엔드포인트
app.get('/process/user/:userId', (req, res) => {
    const userId = req.params.userId;

    pool.getConnection((err, conn) => {
        if (err) {
            console.log('Mysql getConnection error. aborted');
            return res.status(500).send('<h1>SQL 연결 실패</h1>');
        }

        const sql = 'SELECT userName, userAge FROM users WHERE userId = ?';
        conn.query(sql, [userId], (err, results) => {
            conn.release(); // 연결 반환

            if (err || results.length === 0) {
                console.log('SQL 실행 중 오류 발생:', err);
                return res.status(404).send('<h1>사용자를 찾을 수 없습니다.</h1>');
            }

            res.json(results[0]); // 사용자 정보 반환
        });
    });
});

// 사용자 정보를 수정하는 엔드포인트
app.put('/process/editUser/:userId', (req, res) => {
    const userId = req.params.userId;
    const { userName, userAge } = req.body;

    pool.getConnection((err, conn) => {
        if (err) {
            console.log('Mysql getConnection error. aborted');
            return res.status(500).send('<h1>SQL 연결 실패</h1>');
        }

        const sql = 'UPDATE users SET userName = ?, userAge = ? WHERE userId = ?';
        conn.query(sql, [userName, userAge, userId], (err, results) => {
            conn.release(); // 연결 반환

            if (err) {
                console.log('SQL 실행 중 오류 발생:', err);
                return res.status(500).send('<h1>SQL 실행 실패</h1>');
            }

            res.status(200).send('<h1>사용자 정보가 수정되었습니다.</h1>'); // 성공 응답
        });
    });
});



// 로그아웃 처리
app.post('/process/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: '로그아웃 중 오류 발생' });
        }
        res.status(200).json({ message: '로그아웃 성공' });
    });
});

// 서버 시작
app.listen(5500, () => {
    console.log('listening on port 5500');
});
