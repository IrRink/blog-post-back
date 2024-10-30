const pool = require("./pool"); // MySQL 연결을 위한 pool 사용
const bcrypt = require("bcrypt"); // bcrypt 라이브러리 가져오기

class Admin {
  // 관리자가 존재하는지 확인 (role이 'admin'인 사용자 확인)
  static async exists() {
    const [rows] = await pool.execute(
      "SELECT COUNT(*) AS count FROM users WHERE role = ?",
      ["admin"]
    );
    return rows[0].count > 0; // role이 'admin'인 사용자가 있으면 true 반환
  }

  // 이메일로 사용자 존재 여부 확인
  static async checkEmailExists(email) {
    const [rows] = await pool.execute(
      "SELECT COUNT(*) AS count FROM users WHERE email = ?",
      [email]
    );
    return rows[0].count > 0; // 이메일이 존재하면 true 반환
  }

  // 관리자 등록 (role은 'admin'으로 설정)
  // 관리자 생성 메서드
  static async create(
    email,
    name,
    age,
    password,
    securityQuestion,
    securityAnswer
  ) {
    // 이미 `id=1`인 관리자가 있는지 확인
    const [adminExists] = await pool.execute(
      "SELECT * FROM users WHERE id = 1 AND role = 'admin'"
    );

    // 관리자가 이미 있다면 생성하지 않고 에러 반환
    if (adminExists.length > 0) {
      throw new Error(
        "관리자는 이미 존재합니다. 새로운 관리자를 추가할 수 없습니다."
      );
    }

    // 관리자가 없다면 id를 1로 고정하여 생성
    const [result] = await pool.execute(
      "INSERT INTO users (id, email, name, age, password, role, created_date, security_question, security_answer) VALUES (?, ?, ?, ?, ?, 'admin', NOW(), ?, ?)",
      [1, email, name, age, password, securityQuestion, securityAnswer]
    );

    return result;
  }
}

module.exports = Admin;
