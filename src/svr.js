const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const static = require('serve-static');
const bcrypt = require('bcrypt');
const session = require('express-session');
const cors = require('cors');
const dbconfig = require('../dbconfig/dbconfig.json');
require('dotenv').config();
const MySQLStore = require('express-mysql-session')(session);

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

// MySQL 연결 풀 생성
const pool = mysql.createPool({
    connectionLimit: 10,
    host: dbconfig.host,
    user: dbconfig.user,
    password: dbconfig.password,
    database: dbconfig.database,
    debug: false
});

// 세션 저장소 생성, pool을 전달
const sessionStore = new MySQLStore({}, pool);

// 세션 미들웨어 설정
app.use(session({
    key: 'session_cookie_name',
    secret: process.env.SESSION_SECRET || 'session_cookie_secret', // .env 파일에서 세션 비밀 키 로드
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 쿠키 유효 기간 (예: 1일)
    }
}));

// 이후에 pool을 이용한 데이터베이스 작업
app.post('/someRoute', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ message: 'SQL 연결 실패' });
        }

        const sql = 'SELECT * FROM some_table WHERE some_column = ?';
        connection.query(sql, [req.body.someData], (err, results) => {
            connection.release();
            if (err) {
                return res.status(500).json({ message: 'SQL 실행 실패' });
            }
            res.json(results);
        });
    });
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


// 아이디 중복 체크
app.get('/process/checkid/:userId', (req, res) => {
    const userId = req.params.userId;

    pool.getConnection((err, conn) => {
        if (err) {
            console.error('SQL 연결 실패:', err);
            return res.status(500).json({ message: 'SQL 연결 실패' });
        }

        const sql = 'SELECT COUNT(*) AS count FROM users WHERE id = ?';
        conn.query(sql, [userId], (err, rows) => {
            conn.release(); // 연결 해제는 항상 수행

            if (err) {
                console.error('SQL 실행 실패:', err);
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
    const { userId, name, age, password } = req.body;

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 추가 쿼리
    const sql = 'INSERT INTO admin (id, name, password) VALUES (?, ?, ?)';
    pool.getConnection((err, conn) => {
        if (err) {
            console.error('SQL 연결 실패:', err);
            return res.status(500).json({ message: 'SQL 연결 실패' });
        }

        conn.query(sql, [userId, name, hashedPassword], (err, result) => {
            conn.release(); // 연결 해제는 항상 수행

            if (err) {
                console.error('SQL 실행 실패:', err);
                return res.status(500).json('관리자가 이미 존재합니다.' );
            }
            return res.json({ message: '관리자 등록이 완료되었습니다.' });
        });
    });
});

app.post('/process/adduseroruser', async (req, res) => {
    const { userId, name, age, password } = req.body;

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 추가 쿼리
    const sql = 'INSERT INTO users (id, name, age, password) VALUES (?, ?, ?, ?)';
    pool.getConnection((err, conn) => {
        if (err) {
            console.error('SQL 연결 실패:', err);
            return res.status(500).json({ message: 'SQL 연결 실패' });
        }

        conn.query(sql, [userId, name, age, hashedPassword], (err, result) => {
            conn.release(); // 연결 해제는 항상 수행

            if (err) {
                console.error('SQL 실행 실패:', err);
                return res.status(500).json("동일한 아이디가 존재합니다." );
            }
            return res.json( "회원가입이 완료되었습니다." );
        });
    });
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


app.get('/process/check-session', (req, res) => {
    if (req.session.userId) {
        res.json({ message: '세션이 존재합니다.', userId: req.session.userId });
    } else {
        res.status(401).json({ message: '로그인이 필요합니다.' });
    }
});

// 사용자 정보 불러오기
// 사용자 세션 정보 불러오기
app.get('/process/check-session', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const sql = 'SELECT userId, userName, userAge FROM sessions WHERE sessionId = ?';
    pool.getConnection((err, conn) => {
        if (err) {
            return res.status(500).json({ message: 'SQL 연결 실패' });
        }

        conn.query(sql, [req.sessionID], (err, rows) => {
            conn.release(); // 연결 해제

            if (err) {
                console.error('SQL 실행 실패:', err);
                return res.status(500).json({ message: 'SQL 실행 실패' });
            }

            if (rows.length > 0) {
                return res.json(rows[0]); // 사용자 정보 반환
            } else {
                return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
            }
        });
    });
});


// 사용자 정보 수정
app.put('/process/editMyInfo', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const { userId, userName, userAge } = req.body;

    const sql = 'UPDATE users SET name = ?, age = ? WHERE id = ?';
    pool.getConnection((err, conn) => {
        if (err) {
            return res.status(500).json({ message: 'SQL 연결 실패' });
        }

        conn.query(sql, [userName, userAge, req.session.userId], (err, result) => {
            conn.release(); // 연결 해제

            if (err) {
                console.error('SQL 실행 실패:', err);
                return res.status(500).json({ message: 'SQL 실행 실패' });
            }

            return res.json({ message: '사용자 정보가 수정되었습니다.' });
        });
    });
});



// 로그아웃 처리
app.post('/process/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: '로그아웃 중 오류 발생' });
        }

        // 쿠키 삭제
        res.clearCookie('session_cookie_name'); // 세션 쿠키 이름에 맞게 변경하세요
        res.status(200).json({ message: '로그아웃 성공' });
    });
});


// 서버 시작
app.listen(5500, () => {
    console.log('listening on port 5500');
});
