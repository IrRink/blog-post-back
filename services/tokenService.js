const jwt = require("jsonwebtoken");

// JWT 토큰 생성 (이메일만 포함)
const generateToken = (email) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT 시크릿 키가 설정되지 않았습니다.");
  }
  return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "30m" });
};

// 토큰 검증 기능
const verifyToken = (token) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT 시크릿 키가 설정되지 않았습니다.");
    }

    // 토큰 형식 검증
    if (typeof token !== "string" || token.split(".").length !== 3) {
      throw new Error("유효하지 않은 JWT 형식입니다.");
    }

    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    // 다양한 오류 유형 처리
    if (error instanceof jwt.JsonWebTokenError) {
      console.error("JWT 오류:", error.message);
    } else if (error instanceof jwt.TokenExpiredError) {
      console.error("토큰 만료:", error.message);
    } else {
      console.error("알 수 없는 오류:", error.message);
    }
    throw new Error("유효하지 않은 토큰입니다.");
  }
};

module.exports = { generateToken, verifyToken };
