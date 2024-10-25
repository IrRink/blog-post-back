const jwt = require("jsonwebtoken");
const { findByEmail } = require("../models/userModal"); // findByEmail 함수는 비동기로 동작
const JWT_SECRET = process.env.JWT_SECRET; // 비밀 키 환경 변수에서 가져오기

const authenticateJWT = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).send("인증 토큰이 없습니다.");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // JWT 토큰 검증

    // decoded.email로 사용자 정보를 가져오기
    const user = await findByEmail(decoded.email);

    if (!user) {
      return res.status(404).send("사용자를 찾을 수 없습니다.");
    }

    // user의 name을 req.user에 저장
    req.user = user.name;
    req.role = user.role;
    req.email = user.email;

    next();
  } catch (err) {
    console.error("JWT 검증 중 오류 발생:", err);
    return res.status(403).send("유효하지 않은 토큰입니다.");
  }
};

module.exports = authenticateJWT;
