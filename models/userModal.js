const pool = require('./pool');
const bcrypt = require('bcrypt');

class User {
    static async create(email, name, age, password) {
        // 비밀번호를 해싱
        const hashedPassword = await bcrypt.hash(password, 10);
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

    // 이메일 존재 여부 체크 메소드
    static async checkEmailExists(email) {
        const user = await this.findByEmail(email); // 이메일로 사용자 검색
        return !!user; // 사용자가 존재하면 true, 없으면 false 반환
    }
}

module.exports = User;