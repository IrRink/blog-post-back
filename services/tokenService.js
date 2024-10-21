const jwt = require('jsonwebtoken');

// JWT 토큰 생성 (이메일만 포함)
const generateToken = (email) => {
    return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// 토큰 검증 기능
const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
