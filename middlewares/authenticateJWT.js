// middleware/authenticateJWT.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).send('인증 토큰이 없습니다.');
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send('유효하지 않은 토큰입니다.');
    }

    req.user = decoded; // 요청 객체에 사용자 정보를 저장
    next();
  });
};

module.exports = authenticateJWT;
