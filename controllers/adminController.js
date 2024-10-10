const bcrypt = require('bcrypt'); // bcrypt 모듈 불러오기





const adminName = (pool) => {
    return (req, res) => {
        const sql = 'SELECT name FROM admin LIMIT 1';

        pool.getConnection((err, conn) => {
            if (err) {
                return res.status(500).json({ message: 'SQL 연결 실패' });
            }

            conn.query(sql, (err, rows) => {
                conn.release();

                if (err) {
                    return res.status(500).json({ message: 'SQL 실행 실패' });
                }

                if (rows.length === 0) {
                    return res.status(404).json({ message: '관리자를 찾을 수 없습니다.' });
                }

                const adminName = rows[0].name;
                res.json({ adminName });
            });
        });
    };
};

const adminAndUserCount = (pool) => (req, res) => {
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

// 모듈 내보내기
module.exports = {
    adminName,
    adminAndUserCount
};
