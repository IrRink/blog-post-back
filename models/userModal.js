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

  static async updateUser(currentEmail, updatedData) {
    const sql = `
      UPDATE users
      SET name = ?, age = ?, email = ?, password = ?
      WHERE email = ?
    `;
    const { name, age, email, password } = updatedData;
    const values = [name, age, email, password, currentEmail];

    const [result] = await pool.execute(sql, values);
    return result; // 업데이트 결과 반환
  }

  static async deleteByEmail(email) {
    const sql = `
      DELETE FROM users
      WHERE email = ?
    `;
    const values = [email];

    const [result] = await pool.execute(sql, values);
    return result;
  }
  static async checkEmailExists(email) {
    const sql = `SELECT * FROM users WHERE email = ?`;
    const [result] = await pool.execute(sql, [email]);
    return result.length > 0; // 사용자가 존재하면 true 반환
  }

  static async updatePassword(email, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10); // 비밀번호 해시화
    const sql = `UPDATE users SET password = ? WHERE email = ?`;
    await pool.execute(sql, [hashedPassword, email]); // 비밀번호 업데이트
  }
}
module.exports = User;
