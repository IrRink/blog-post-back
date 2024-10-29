const pool = require("./pool");
const bcrypt = require("bcrypt");

class User {
  static async create(
    email,
    name,
    age,
    password,
    role,
    securityQuestion,
    securityAnswer
  ) {
    const [result] = await pool.execute(
      "INSERT INTO users (email, name, age, password, role, created_date, security_question, security_answer) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)",
      [email, name, age, password, role, securityQuestion, securityAnswer]
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

  // 사용자 정보 업데이트 메서드
  static async updateUser(currentEmail, updatedData) {
    const fieldsToUpdate = [];
    const values = [];

    // 업데이트할 필드 체크
    if (updatedData.name) {
      fieldsToUpdate.push("name = ?");
      values.push(updatedData.name);
    }
    if (updatedData.age) {
      fieldsToUpdate.push("age = ?");
      values.push(updatedData.age);
    }
    if (updatedData.email) {
      fieldsToUpdate.push("email = ?");
      values.push(updatedData.email);
    }
    if (updatedData.password) {
      fieldsToUpdate.push("password = ?");
      values.push(updatedData.password);
    }

    values.push(currentEmail); // where 절의 현재 이메일

    const sql = `
      UPDATE users
      SET ${fieldsToUpdate.join(", ")}
      WHERE email = ?
    `;

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
  static async findEmailBySecurityInfo(
    name,
    age,
    securityQuestion,
    securityAnswer
  ) {
    const sql = `
        SELECT email FROM users
        WHERE name = ? AND age = ? AND security_question = ? AND security_answer = ?
    `;
    const [rows] = await pool.execute(sql, [
      name,
      age,
      securityQuestion,
      securityAnswer,
    ]);
    if (rows.length === 0) {
      throw new Error("입력된 정보와 일치하는 사용자가 없습니다.");
    }
    return rows[0].email; // 이메일 반환
  }
}

module.exports = User;
