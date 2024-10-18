const pool = require('./pool');
const bcrypt = require('bcrypt');

class User {
    static async create(email, name, age, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.execute(
            'INSERT INTO users (email, name, age, password) VALUES (?, ?, ?, ?)', 
            [email, name, age, hashedPassword]
        );
        return result;
    }

    static async findByEmail(email) {
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0]; // 첫 번째 사용자 반환
    }

    static async checkEmailExists(email) {
        const [rows] = await pool.execute('SELECT COUNT(*) AS count FROM users WHERE email = ?', [email]);
        return rows[0].count > 0; // 존재하면 true 반환
    }

}

module.exports = User;
