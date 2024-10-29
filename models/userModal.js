const pool = require("./pool");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

class User {
  // 새 사용자 생성 메서드
  static async create(
    email,
    name,
    age,
    password,
    role,
    securityQuestion,
    securityAnswer
  ) {
    // 새로운 사용자를 데이터베이스의 users 테이블에 삽입
    const [result] = await pool.execute(
      "INSERT INTO users (email, name, age, password, role, created_date, security_question, security_answer) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)",
      [email, name, age, password, role, securityQuestion, securityAnswer]
    );
    return result; // 생성된 사용자의 삽입 결과 반환
  }

  // 이메일로 사용자 찾기 메서드
  static async findByEmail(email) {
    // 이메일에 해당하는 사용자를 데이터베이스에서 조회
    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0]; // 첫 번째 결과 반환 (해당 사용자가 없으면 undefined 반환)
  }

  // 이메일 존재 여부 확인 메서드
  static async checkEmailExists(email) {
    // 특정 이메일이 users 테이블에 존재하는지 확인
    const [rows] = await pool.execute(
      "SELECT COUNT(*) AS count FROM users WHERE email = ?",
      [email]
    );
    return rows[0].count > 0; // 해당 이메일이 존재하면 true, 아니면 false 반환
  }

  // 사용자 정보 업데이트 메서드
  static async updateUser(currentEmail, updatedData) {
    const fieldsToUpdate = [];
    const values = [];

    // 업데이트할 필드를 확인하여 쿼리에 포함
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

    values.push(currentEmail); // 현재 이메일을 WHERE 절 조건에 추가

    const sql = `
      UPDATE users
      SET ${fieldsToUpdate.join(", ")}
      WHERE email = ?
    `;

    // 사용자 정보를 업데이트하고 결과 반환
    const [result] = await pool.execute(sql, values);
    return result;
  }

  // 이메일을 통해 사용자 삭제 메서드
  static async deleteByEmail(email) {
    const sql = `
      DELETE FROM users
      WHERE email = ?
    `;
    const values = [email];

    // 지정한 이메일로 사용자 삭제
    const [result] = await pool.execute(sql, values);
    return result;
  }

  // 이메일과 보안 질문/답변이 일치하는지 확인하는 메서드
  static async checkSecurityDetails(email, securityQuestion, securityAnswer) {
    const sql = `SELECT * FROM users WHERE email = ? AND security_question = ? AND security_answer = ?`;
    const [rows] = await pool.execute(sql, [
      email,
      securityQuestion,
      securityAnswer,
    ]);
    return rows.length > 0; // 일치하는 사용자가 있으면 true, 없으면 false 반환
  }

  // 비밀번호 업데이트 메서드
  static async updatePassword(email, hashedPassword) {
    const sql = `UPDATE users SET password = ? WHERE email = ?`;
    await pool.execute(sql, [hashedPassword, email]); // 비밀번호를 해시화한 값으로 업데이트
  }

  // 보안 정보로 이메일 찾기 메서드
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
