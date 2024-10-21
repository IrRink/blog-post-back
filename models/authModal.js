// models/authModal.js
const pool = require('./pool');

const authModel = {
  // 관리자 가입 날짜 가져오기
  getAdminDate: async () => {
    const query = 'SELECT admin_date FROM admin LIMIT 1';
    try {
      const [results] = await pool.query(query); // async/await 사용
      return results[0].admin_date; // 결과의 첫 번째 레코드의 가입 날짜 반환
    } catch (error) {
      throw error; // 에러 발생 시 throw로 전달
    }
  },

  // 일반 사용자 수 가져오기
  getUserCount: async () => {
    const query = 'SELECT COUNT(*) AS userCount FROM users';
    try {
      const [results] = await pool.query(query); // async/await 사용
      return results[0].userCount; // 사용자 수 반환
    } catch (error) {
      throw error; // 에러 발생 시 throw로 전달
    }
  },

  // 관리자 이름 가져오기
  getAdminName: async () => {
    const query = 'SELECT name FROM admin LIMIT 1';
    try {
      const [results] = await pool.query(query);
      if (results.length === 0) {
        throw new Error('관리자가 없습니다.'); // 결과가 없을 경우 처리
      }
      return results[0].name; // 결과의 첫 번째 레코드의 관리자 이름 반환
    } catch (error) {
      throw error;
    }
  },

  // 관리자 이메일 가져오기
  getAdminEamil: async () => {
    const query = 'SELECT email FROM admin LIMIT 1';
    try {
      const [results] = await pool.query(query);
      if (results.length === 0) {
        throw new Error('관리자가 없습니다.'); // 결과가 없을 경우 처리
      }
      return results[0].email; // 결과의 첫 번째 레코드의 관리자 이메일 반환
    } catch (error) {
      throw error;
    }
  },
};

module.exports = authModel;
