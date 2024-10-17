const jwt = require('jsonwebtoken');

exports.refreshToken = async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(401).json({ error: 'Refresh Token이 필요합니다.' });
    }

    try {
        // Refresh Token 검증
        const user = jwt.verify(token, process.env.JWT_SECRET);

        // 새로운 Access Token 생성
        const accessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });

        res.status(200).json({ accessToken });
    } catch (err) {
        console.error('Refresh Token 검증 오류:', err);
        return res.status(403).json({ error: 'Refresh Token이 유효하지 않습니다.' });
    }
};
