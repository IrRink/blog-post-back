const User = require("../models/userModal");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("./tokenService"); // 토큰 생성 로직을 포함한 파일
const pool = require("../models/pool");
const crypto = require("crypto");
const {
  emailRegex,
  nameRegex,
  passwordRegex,
  ageRegex,
} = require("../models/regex"); // 정규 표현식 불러오기

class UserService {
  // 사용자 등록
  static async registerUser(
    email,
    name,
    age,
    password,
    role,
    securityQuestion,
    securityAnswer
  ) {
    // 필수 필드가 비어있는지 확인
    if (
      !email ||
      !name ||
      !age ||
      !password ||
      !securityQuestion ||
      !securityAnswer
    ) {
      throw new Error("필수 필드가 비어 있습니다.");
    }

    // 정규 표현식으로 입력값 검증
    if (!emailRegex.test(email)) {
      throw new Error("유효하지 않은 이메일입니다.");
    }
    if (!nameRegex.test(name)) {
      throw new Error("이름은 2자 이상의 한글 또는 영문자여야 합니다.");
    }
    if (!ageRegex.test(age)) {
      throw new Error("나이는 1세 이상 100세 이하이어야 합니다.");
    }
    if (!passwordRegex.test(password)) {
      throw new Error(
        "비밀번호는 최소 8자 이상이며, 대문자, 소문자, 숫자 및 특수 문자를 포함해야 합니다."
      );
    }

    // 이메일 중복 확인
    const existingUser = await User.findByEmail(email);
    if (existingUser) throw new Error("이미 존재하는 이메일입니다.");
    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // role이 주어지지 않으면 기본값 'user'로 설정
    const userRole = role || "user";

    // 유저 생성
    return await User.create(
      email,
      name,
      age,
      hashedPassword,
      userRole,
      securityQuestion,
      securityAnswer
    );
  }

  static async checkEmailExists(email) {
    return await User.checkEmailExists(email);
  }

  // 사용자 로그인
  static async loginUser(email, password, isAdmin) {
    let user;

    try {
      // 정규 표현식으로 이메일 검증
      if (!emailRegex.test(email)) {
        throw new Error("유효하지 않은 이메일입니다.");
      }

      // 사용자 테이블에서 이메일 조회
      user = await User.findByEmail(email);
      if (!user) {
        throw new Error("사용자가 없거나, 이메일이 잘못되었습니다.");
      }

      // 관리자로 로그인하는 경우 role이 'admin'인지 확인
      if (isAdmin) {
        if (user.role !== "admin") {
          throw new Error("관리자 계정이 아닙니다.");
        }
      } else {
        // 체크박스가 선택되지 않은 경우 관리자가 아닌 일반 사용자로 로그인하도록 제한
        if (user.role === "admin") {
          throw new Error("로그인 할 수 없습니다.");
        }
      }
      // 비밀번호 비교

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("비밀번호가 틀립니다.");
      }

      // 토큰 생성
      const token = generateToken(user.email);
      return { user, token };
    } catch (error) {
      console.error("로그인 처리 중 오류 발생:", error.message);
      throw error;
    }
  }

  // 로그아웃 기능
  static async invalidateRefreshToken(token) {
    try {
      await pool.execute("DELETE FROM sessions WHERE token = ?", [token]);
    } catch (error) {
      console.error("리프레시 토큰 무효화 오류:", error.message);
      throw new Error("리프레시 토큰 무효화 중 오류가 발생했습니다.");
    }
  }
  static async getUserInfo(req) {
    try {
      const token = req.headers.authorization.split(" ")[1]; // Authorization 헤더에서 토큰 추출
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // 토큰 검증
      const email = decoded.email;

      // 사용자 정보 조회
      const user = await User.findByEmail(email);
      if (!user) {
        throw new Error("사용자를 찾을 수 없습니다.");
      }

      return user; // 사용자 정보를 반환
    } catch (error) {
      console.error("사용자 정보 조회 중 오류 발생:", error.message);
      throw new Error("사용자 정보 조회 중 오류가 발생했습니다.");
    }
  }
  // 사용자 정보수정
  static async updateUserInfo(currentEmail, userData) {
    // 기존 사용자 정보 가져오기
    const existingUser = await User.findByEmail(currentEmail);
    if (!existingUser) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    // 이메일 중복 체크
    if (userData.email && userData.email !== currentEmail) {
      const emailExists = await User.findByEmail(userData.email);
      if (emailExists) {
        throw new Error("이메일이 이미 존재합니다.");
      }
    }

    // 입력이 없는 필드에 기존 데이터 기본값 설정
    const name =
      userData.name !== undefined ? userData.name : existingUser.name;
    const age = userData.age !== undefined ? userData.age : existingUser.age;
    const email =
      userData.email !== undefined ? userData.email : existingUser.email;
    let password = existingUser.password; // 기본적으로 기존 비밀번호 유지

    // 정규 표현식 검사
    if (userData.email && !emailRegex.test(userData.email)) {
      throw new Error("유효하지 않은 이메일 형식입니다.");
    }
    if (userData.name && !nameRegex.test(userData.name)) {
      throw new Error("유효하지 않은 이름 형식입니다.");
    }
    if (userData.age && !ageRegex.test(userData.age)) {
      throw new Error("유효하지 않은 나이입니다.");
    }
    if (userData.password && !passwordRegex.test(userData.password)) {
      throw new Error("유효하지 않은 비밀번호 형식입니다.");
    }

    // 비밀번호 해시 처리 (빈 문자열일 경우 제외)
    if (userData.password && userData.password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(userData.password, salt);
    }

    console.log("기존 사용자 정보:", existingUser);
    console.log("변경된 사용자 정보:", { name, age, email });

    // 사용자 정보 업데이트
    const updatedUserData = { name, age, email };
    if (userData.password && userData.password.trim() !== "") {
      updatedUserData.password = password; // 비밀번호 변경 시에만 추가
    }

    const updatedUser = await User.updateUser(currentEmail, updatedUserData);
    return updatedUser;
  }
  // 사용자 계정 삭제
  static async deleteUser(email) {
    const sql = `
      DELETE FROM users
      WHERE email = ?
    `;
    const values = [email];

    const [result] = await pool.execute(sql, values);
    console.log("삭제된 사용자 수:", result.affectedRows); // 삭제된 행 수 로그 추가
    if (result.affectedRows === 0) {
      throw new Error("삭제할 사용자를 찾을 수 없습니다.");
    }
    return result; // 삭제 결과 반환
  }

  // 임시 비밀번호 생성
  static generateTemporaryPassword(length = 8) {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString("hex")
      .slice(0, length);
  }

  // 임시비밀번호
  static async resetPassword(email, securityQuestion, securityAnswer) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    if (
      user.security_question !== securityQuestion ||
      user.security_answer !== securityAnswer
    ) {
      throw new Error("보안 질문 또는 답변이 일치하지 않습니다.");
    }

    const temporaryPassword = this.generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10); // 비밀번호 해시화

    await User.updatePassword(email, hashedPassword); // 모델의 비밀번호 업데이트 메서드 호출

    return temporaryPassword; // 임시 비밀번호 반환
  }
  static async getEmailBySecurityInfo(
    name,
    age,
    securityQuestion,
    securityAnswer
  ) {
    const rows = await User.findEmailBySecurityInfo(
      name,
      age,
      securityQuestion,
      securityAnswer
    );
    if (rows.length === 0) {
      throw new Error("입력된 정보와 일치하는 사용자가 없습니다.");
    }
    return rows[0].email; // 이메일 반환
  }
}
module.exports = UserService;
