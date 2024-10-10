const bcrypt = require('bcrypt'); // bcrypt 모듈 불러오기

const addAdmin = (pool) => {
    return async (req, res) => {
        console.log(req.body); // 요청 본문 확인

        const { adminId, adminName, adminAge, password } = req.body;

        // 데이터 유효성 검사
        if (!adminId || !adminName || !adminAge || !password) {
            return res.status(400).json({ message: '모든 필드를 채워주세요.' });
        }

        // 비밀번호 길이 체크
        if (password.length < 6) {
            return res.status(400).json({ message: '비밀번호는 최소 6자 이상이어야 합니다.' });
        }

        try {
            // 관리자 ID 중복 체크
            const idCheckSql = 'SELECT id FROM admin WHERE id = ?';
            const existingAdminId = await new Promise((resolve, reject) => {
                pool.getConnection((err, conn) => {
                    if (err) return reject(err);
                    conn.query(idCheckSql, [adminId], (err, rows) => {
                        conn.release();
                        if (err) return reject(err);
                        resolve(rows);
                    });
                });
            });

            if (existingAdminId.length > 0) {
                return res.status(409).json({ message: '이미 사용 중인 ID입니다.' });
            }

            // 관리자 중복 체크
            const adminCheckSql = 'SELECT id FROM admin LIMIT 1'; // 이미 등록된 관리자가 있는지 확인
            const adminCheckRows = await new Promise((resolve, reject) => {
                pool.getConnection((err, conn) => {
                    if (err) return reject(err);
                    conn.query(adminCheckSql, (err, rows) => {
                        conn.release();
                        if (err) return reject(err);
                        resolve(rows);
                    });
                });
            });

            if (adminCheckRows.length >= 1) {
                return res.status(409).json({ message: '이미 관리자 계정이 존재합니다.' });
            }

            // 비밀번호 해싱
            const hashedPassword = await bcrypt.hash(password, 10);

            // SQL 실행
            const sql = 'INSERT INTO admin (id, name, age, password) VALUES (?, ?, ?, ?)';
            const insertResult = await new Promise((resolve, reject) => {
                pool.getConnection((err, conn) => {
                    if (err) return reject(err);
                    conn.query(sql, [adminId, adminName, adminAge, hashedPassword], (err, result) => {
                        conn.release();
                        if (err) return reject(err);
                        resolve(result);
                    });
                });
            });

            // Insert 결과 로그 출력
            console.log('Insert Result:', insertResult);

            res.status(201).json({ message: '관리자 등록 성공', adminId });
        } catch (error) {
            console.error('Error Stack:', error.stack); // 스택 트레이스 출력
            res.status(500).json({ message: '관리자 등록 실패', error: error.message });
        }
    };
};

module.exports = { addAdmin }; // 필요한 함수 export
