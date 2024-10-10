const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const static = require('serve-static');
const bcrypt = require('bcrypt');
const session = require('express-session');
const cors = require('cors');
const dbconfig = require('./dbconfig/dbconfig.json');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

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
    debug: false,
});

// 세션 미들웨어 설정
app.use(session({
    name: 'user',
    secret: process.env.SESSION_SECRET || '0930',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 86400000,
        secure: false,
        sameSite: 'lax',
        httpOnly: true,
        path: '/',
        domain: 'localhost'
    }
}));

// 라우트 설정
app.use('/process', authRoutes(pool)); // 인증 관련 라우트
app.use('/process', userRoutes(pool)); // 사용자 관련 라우트
// 서버 실행
const port = 5500;
app.listen(port, () => {
    console.log(`서버가 ${port}번 포트에서 실행 중입니다.`);
});
