const pool = require('./pool');
const bcrypt = require('bcrypt'); // bcrypt 라이브러리 가져오기

class Admin {
    static async create(email, name, age, password) {
        // 비밀번호를 해싱
        const hashedPassword = await bcrypt.hash(password, 10); // 10은 salt rounds

        const [result] = await pool.execute(
            'INSERT INTO admin (email, name, age, password) VALUES (?, ?, ?, ?)', 
            [email, name, age, hashedPassword]
        );
        return result;
    }

    static async exists() {
        const [rows] = await pool.execute('SELECT COUNT(*) AS count FROM admin');
        return rows[0].count > 0; // 이미 어드민이 존재하는지 체크
    }

    static async findByEmail(email) {
      const [rows] = await pool.execute('SELECT * FROM admin WHERE email = ?', [email]);
      return rows[0]; // 관리자 정보를 반환
  }
}

module.exports = Admin;
