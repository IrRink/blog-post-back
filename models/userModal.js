const pool = require('./pool');
const bcrypt = require('bcrypt'); // bcrypt 라이브러리 가져오기

class User {
    static async create(email, name, age, password) {
        // 비밀번호를 해싱
        const hashedPassword = await bcrypt.hash(password, 10); // 10은 salt rounds

        const [result] = await pool.execute(
            'INSERT INTO users (email, name, age, password) VALUES (?, ?, ?, ?)', 
            [email, name, age, hashedPassword]
        );
        return result;
    }

    static async findByEmail(email) {
      const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0]; // 사용자 정보를 반환
  }

    // 필요에 따라 추가적인 메소드 정의 가능
}

module.exports = User;
