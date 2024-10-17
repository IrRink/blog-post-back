// models/userModel.js
const pool = require('./pool');

const userModel = {
  // 관리자 가입 날짜 가져오기
  getAdminDate: (callback) => {
    const query = 'SELECT admin_date FROM admin LIMIT 1';
    pool.query(query, (error, results) => {
      if (error) return callback(error); // 에러 발생 시 콜백 호출
      callback(null, results[0].admin_date); // 결과의 첫 번째 레코드의 가입 날짜 반환
    });
  },

  // 일반 사용자 수 가져오기
  getUserCount: (callback) => {
    const query = 'SELECT COUNT(*) AS userCount FROM users';
    pool.query(query, (error, results) => {
      if (error) return callback(error); // 에러 발생 시 콜백 호출
      callback(null, results[0].userCount); // 사용자 수 반환
    });
  }
};

module.exports = userModel;
