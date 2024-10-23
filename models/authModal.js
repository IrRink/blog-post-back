// models/authModal.js
const pool = require('./pool');

const authModel = {
  getAdminDate: async () => {
    const [rows] = await pool.execute('SELECT created_date FROM users WHERE role = ?', ['admin']);
    return rows.length > 0 ? rows[0].created_date : null; // 관리자 가입 날짜 반환
  },

  // 일반 사용자 수 가져오기
  getUserCount: async () => {
    const [rows] = await pool.execute('SELECT COUNT(*) AS count FROM users WHERE role = ?', ['user']);
    return rows[0].count; // 사용자 수 반환
  },

  // 관리자 이름 가져오기
  getAdminName: async () => {
    const [rows] = await pool.execute('SELECT name FROM users WHERE role = ?', ['admin']);
    return rows.length > 0 ? rows[0].name : null; // 관리자 이름 반환
  },

  // 관리자 이메일 가져오기
  // models/authModal.js
  getAdminEmail: async () => {
    const query = 'SELECT email FROM users WHERE role = ?'; // 쿼리 문자열 수정
    try {
      const [results] = await pool.execute(query, ['admin']); // 파라미터를 쿼리와 분리하여 전달
      if (results.length === 0) {
        throw new Error('관리자가 없습니다.'); // 결과가 없을 경우 처리
      }
      return results[0].email; // 결과의 첫 번째 레코드의 관리자 이메일 반환
    } catch (error) {
      throw error; // 에러 발생 시 throw
    }
  },

};

module.exports = authModel;
