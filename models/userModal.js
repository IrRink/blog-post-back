const pool = require("./pool");
const bcrypt = require("bcrypt");

class User {
  static async create(email, name, age, password, role) {
    const [result] = await pool.execute(
      "INSERT INTO users (email, name, age, password, role, created_date) VALUES (?, ?, ?, ?, ?, NOW())",
      [email, name, age, password, role] // 비밀번호가 해싱된 상태로 넘어온다
    );
    return result;
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0]; // 첫 번째 결과 반환
  }
  static async checkEmailExists(email) {
    const [rows] = await pool.execute(
      "SELECT COUNT(*) AS count FROM users WHERE email = ?",
      [email]
    );
    return rows[0].count > 0; // 존재하면 true 반환
  }

  // 모델 파일

  static async updateUser(currentEmail, updatedData) {
    const { name, age, email } = updatedData;

    const sql = `
      UPDATE users 
      SET 
        name = ?, 
        age = ?, 
        email = ? 
      WHERE email = ?
    `;

    // SQL 쿼리의 파라미터
    const values = [name, age, email, currentEmail];

    try {
      const [result] = await pool.execute(sql, values);
      return result; // 수정된 사용자 정보 반환
    } catch (error) {
      console.error("사용자 정보 수정 중 오류 발생:", error.message);
      throw error; // 오류를 던져서 상위 함수에서 처리
    }
  }
}

module.exports = User;
