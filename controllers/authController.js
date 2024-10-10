const bcrypt = require('bcrypt');

exports.login = (pool) => (req, res) => {
    const { role } = req.params; // 사용자 역할 (user 또는 admin)
    const { userId, password } = req.body;

    pool.getConnection((err, conn) => {
        if (err) {
            return res.status(500).json({ message: 'SQL 연결 실패' });
        }

        let sql;
        if (role === 'admin') {
            sql = 'SELECT * FROM admin WHERE id = ?';
        } else {
            sql = 'SELECT * FROM users WHERE id = ?';
        }

        conn.query(sql, [userId], async (err, rows) => {
            conn.release();

            if (err) {
                return res.status(500).json({ message: 'SQL 실행 실패' });
            }

            if (rows.length === 0) {
                return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
            }

            const user = rows[0];
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
            }

            // 로그인 성공
            req.session.userId = user.id; // 세션에 사용자 ID 저장
            req.session.userName = user.name; // 세션에 사용자 이름 저장
            req.session.userAge = user.age; // 세션에 사용자 나이 저장

            res.status(200).json({ message: '로그인 성공', userId: user.id, userName: user.name });
        });
    });
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: '로그아웃 실패' });
        }
        res.status(200).json({ message: '로그아웃 성공' });
    });
};


exports.checkSession = (req, res) => {
    if (req.session && req.session.userId) {
        // 세션 정보가 있을 경우
        res.status(200).json({ 
            message: '세션이 유효합니다.', 
            userId: req.session.userId, 
            userName: req.session.userName 
        });
    } else {
        // 세션 정보가 없을 경우
        res.status(404).json({ message: '세션이 유효하지 않습니다.' });
    }
};

const express = require('express');

// 관리자 정보와 회원 수를 가져오는 API
exports.adminAndUserCount = (pool) => (req, res) => {
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
};