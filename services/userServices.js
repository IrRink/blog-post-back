const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModal");

// 사용자 등록 함수
const registerUser = async (pool, email, userName, userAge, password) => {
  const emailCheckRows = await userModel.checkUserEmailExists(pool, email);
  if (emailCheckRows.length > 0) {
    throw new Error("이미 사용 중인 이메일입니다.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await userModel.insertUser(pool, email, userName, userAge, hashedPassword);

  // JWT 토큰 생성
  const token = jwt.sign({ email, role: "user" }, process.env.JWT_SECRET, { expiresIn: "1h" });
  return token; // 생성된 토큰 반환
};

// 사용자 로그인 함수
const loginUser = async (pool, email, password) => {
  const user = await userModel.findUserByEmail(pool, email);
  if (!user) {
    throw new Error("사용자를 찾을 수 없습니다.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("비밀번호가 일치하지 않습니다.");
  }

  // JWT 토큰 생성
  const token = jwt.sign({ email, role: "user" }, process.env.JWT_SECRET, { expiresIn: "1h" });
  return token; // 생성된 토큰 반환
};

module.exports = {
  registerUser,
  loginUser,
};
