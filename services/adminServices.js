const {
  emailRegex,
  nameRegex,
  passwordRegex,
  ageRegex,
} = require("../models/regex"); // 정규 표현식 가져오기
const Admin = require("../models/adminModal"); // Admin 모델 가져오기
const bcrypt = require("bcrypt"); // bcrypt 라이브러리 가져오기
const { generateToken } = require("../services/tokenService"); // 토큰 생성 함수 가져오기

class AdminService {
  // 관리자 등록
  static async registerAdmin(email, name, age, password) {
    // 관리자 존재 여부 확인
    const adminExists = await Admin.exists();
    if (adminExists) {
      throw new Error("이미 관리자가 등록되어 있습니다."); // 관리자가 존재하면 등록 금지
    }

    // 필드 유효성 검사
    if (!emailRegex.test(email)) {
      throw new Error("유효한 이메일 주소를 입력하세요.");
    }
    if (!nameRegex.test(name)) {
      throw new Error("이름은 한글 또는 영문자 2자 이상이어야 합니다.");
    }
    if (!passwordRegex.test(password)) {
      throw new Error(
        "비밀번호는 최소 8자 이상이어야 하며, 대문자, 소문자, 숫자 및 특수 문자를 포함해야 합니다."
      );
    }
    if (!ageRegex.test(age)) {
      throw new Error("나이는 1세 이상 120세 이하의 숫자여야 합니다.");
    }

    // 이메일 중복 확인
    const existingUser = await Admin.checkEmailExists(email);
    if (existingUser) {
      throw new Error("이미 존재하는 이메일입니다."); // 이메일이 존재하면 오류 반환
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 해싱된 비밀번호로 관리자 생성
    return await Admin.create(email, name, age, hashedPassword);
  }
}

module.exports = AdminService;
