const jwt = require('jsonwebtoken');

// JWT 토큰 생성 (이메일만 포함)
const generateToken = (email) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT 시크릿 키가 설정되지 않았습니다.');
    }
    return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

// 토큰 검증 기능
const verifyToken = (token) => {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT 시크릿 키가 설정되지 않았습니다.');
        }
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        console.error('토큰 검증 실패:', error.message);
        throw new Error('유효하지 않은 토큰입니다.');
    }
};

module.exports = { generateToken, verifyToken };
