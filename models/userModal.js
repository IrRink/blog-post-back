const pool = require('../models/pool'); // 연결 풀 가져오기

// 이메일 존재 여부 확인
const checkEmailExists = (email) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, conn) => {
            if (err) return reject(err);
            const sql = "SELECT COUNT(*) AS count FROM users WHERE email = ? UNION SELECT COUNT(*) AS count FROM admin WHERE email = ?";
            conn.query(sql, [email, email], (err, result) => {
                conn.release();
                if (err) return reject(err);
                resolve(result[0].count > 0);
            });
        });
    });
};

// 사용자 추가
const insertUser = (email, name, age, password) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, conn) => {
            if (err) return reject(err);
            const sql = "INSERT INTO users (email, name, age, password) VALUES (?, ?, ?, ?)";
            conn.query(sql, [email, name, age, password], (err, result) => {
                conn.release();
                if (err) return reject(err);
                resolve(result.insertId);
            });
        });
    });
};

// 관리자 추가
const insertAdmin = (email, name, age, password) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, conn) => {
            if (err) return reject(err);
            const sql = "INSERT INTO admin (email, name, age, password) VALUES (?, ?, ?, ?)";
            conn.query(sql, [email, name, age, password], (err, result) => {
                conn.release();
                if (err) return reject(err);
                resolve(result.insertId);
            });
        });
    });
};

module.exports = {
    checkEmailExists,
    insertUser,
    insertAdmin,
};
