const pool = require("./pool");
const bcrypt = require("bcrypt");

class User {
  static async create(email, name, age, password, role) {
    const [result] = await pool.execute(
      "INSERT INTO users (email, name, age, password, role, created_date) VALUES (?, ?, ?, ?, ?, NOW())",
      [email, name, age, password, role] // created_date은 NOW()로 설정
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
  static async updateUser(email, data) {
    const { name, age } = data; // 업데이트할 데이터 추출
    await pool.execute("UPDATE users SET name = ?, age = ? WHERE email = ?", [
      name,
      age,
      email,
    ]);
  }
  static async deleteByEmail(email) {
    await pool.execute("DELETE FROM users WHERE email = ?", [email]);
  }
}

module.exports = User;
