const bcrypt = require('bcrypt');

// 사용자 등록 함수
const addUser = (pool) => {
    return async (req, res) => {
        const { userId, userName, userAge, password } = req.body;

        // 데이터 유효성 검사
        if (!userId || !userName || !userAge || !password) {
            return res.status(400).json({ message: '모든 필드를 채워주세요.' });
        }

        try {
            // 사용자 ID 중복 체크
            const idCheckRows = await new Promise((resolve, reject) => {
                pool.getConnection((err, conn) => {
                    if (err) return reject(err);
                    const sqlCheck = 'SELECT id FROM users WHERE id = ?';
                    conn.query(sqlCheck, [userId], (err, result) => {
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

            // 사용자 등록 SQL 실행
            const sqlInsert = 'INSERT INTO users (id, name, age, password) VALUES (?, ?, ?, ?)';
            await new Promise((resolve, reject) => {
                pool.getConnection((err, conn) => {
                    if (err) {
                        console.error('MySQL 연결 오류:', err);
                        return reject(err);
                    }
                    conn.query(sqlInsert, [userId, userName, userAge, hashedPassword], (err, result) => {
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
            res.status(201).json({ message: '사용자 등록 성공', userId });
        } catch (error) {
            console.error('사용자 등록 중 오류 발생:', error);
            res.status(500).json({ message: '사용자 등록 실패', error: error.message });
        }
    };
};

module.exports = { addUser }; // addUser가 올바르게 내보내기
