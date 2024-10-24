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
  static async create(email, name, age, password) {
    const [result] = await pool.execute(
      "INSERT INTO users (email, name, age, password, role, created_date) VALUES (?, ?, ?, ?, ?, NOW())",
      [email, name, age, password, "admin"]
    );
    return result;
  }
}

module.exports = Admin;
