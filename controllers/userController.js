const bcrypt = require('bcrypt');

// 사용자 등록 함수
const addUser = (pool) => {
    return async (req, res) => {
        console.log('회원가입 요청 본문:', req.body); // 요청 본문 확인

        const { userId, userName, userAge, password, isAdmin } = req.body; // isAdmin 추가

        // 데이터 유효성 검사
        if (!userId || !userName || !userAge || !password) {
            return res.status(400).json({ message: '모든 필드를 채워주세요.' });
        }

        try {
            // 사용자 ID 중복 체크
            const idCheckSql = 'SELECT id FROM users WHERE id = ? UNION SELECT id FROM admin WHERE id = ?';
            const idCheckRows = await new Promise((resolve, reject) => {
                pool.getConnection((err, conn) => {
                    if (err) return reject(err);
                    conn.query(idCheckSql, [userId, userId], (err, result) => {
                        conn.release();
                        if (err) return reject(err);
                        resolve(result);
                    });
                });
            });

            if (idCheckRows.length > 0) {
                return res.status(409).json({ message: '이미 사용 중인 아이디입니다.' });
            }

            // 비밀번호 해싱
            const hashedPassword = await bcrypt.hash(password, 10);

            if (isAdmin) {
                // 관리자 중복 체크
                const hasExistingAdmin = await checkExistingAdmin(pool);
                if (hasExistingAdmin) {
                    return res.status(409).json({ message: '이미 관리자 계정이 존재합니다.' });
                }

                // 관리자 등록 SQL 실행
                await insertAdmin(pool, userId, userName, userAge, hashedPassword);
                // 성공 응답
                return res.status(201).json({ message: '관리자 등록 성공', userId });
            } else {
                // 사용자 등록 SQL 실행
                const sqlInsertUser = 'INSERT INTO users (id, name, age, password) VALUES (?, ?, ?, ?)';
                await new Promise((resolve, reject) => {
                    pool.getConnection((err, conn) => {
                        if (err) {
                            console.error('MySQL 연결 오류:', err);
                            return reject(err);
                        }
                        conn.query(sqlInsertUser, [userId, userName, userAge, hashedPassword], (err, result) => {
                            conn.release(); // 연결 반환
                            if (err) {
                                console.error('SQL 쿼리 실행 오류:', err);
                                return reject(err);
                            }
                            resolve(result);
                        });
                    });
                });
                // 성공 응답
                return res.status(201).json({ message: '사용자 등록 성공', userId });
            }
        } catch (error) {
            console.error('사용자 등록 중 오류 발생:', error);
            res.status(500).json({ message: '사용자 등록 실패', error: error.message });
        }
    };
};

// 기존 관리자 체크 함수
const checkExistingAdmin = (pool) => {
    return new Promise((resolve, reject) => {
        const adminCheckSql = 'SELECT id FROM admin LIMIT 1'; // 이미 등록된 관리자가 있는지 확인
        pool.getConnection((err, conn) => {
            if (err) return reject(err);
            conn.query(adminCheckSql, (err, rows) => {
                conn.release();
                if (err) return reject(err);
                resolve(rows.length >= 1); // 관리자가 존재하면 true 반환
            });
        });
    });
};

// 관리자 등록 함수
const insertAdmin = (pool, adminId, adminName, adminAge, hashedPassword) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO admin (id, name, age, password) VALUES (?, ?, ?, ?)';
        pool.getConnection((err, conn) => {
            if (err) return reject(err);
            conn.query(sql, [adminId, adminName, adminAge, hashedPassword], (err, result) => {
                conn.release();
                if (err) return reject(err);
                resolve(result);
            });
        });
    });
};

module.exports = { addUser }; // addUser가 올바르게 내보내기
