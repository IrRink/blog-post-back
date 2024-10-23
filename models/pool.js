const mysql = require("mysql2/promise");
require("dotenv").config(); // 환경 변수 로드

// MySQL 연결 풀 생성
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  debug: false,
  dateStrings: true,
});

// 연결 풀을 모듈로 내보내기
module.exports = pool;
