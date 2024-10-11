const checkId = (pool) => {
    return (req, res) => {
        const { userId } = req.params;

        const sqlCheck = 'SELECT id FROM users WHERE id = ?';
        pool.query(sqlCheck, [userId], (error, results) => {
            if (error) {
                console.error('ID 중복 체크 오류:', error);
                return res.status(500).json({ message: '서버 오류' });
            }

            if (results.length > 0) {
                return res.status(409).json({ message: '이미 사용 중인 아이디입니다.' });
            }
            res.status(200).json({ message: '사용 가능한 아이디입니다.' });
        });
    };
};

module.exports = checkId;
