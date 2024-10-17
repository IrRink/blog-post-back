// services/userService.js
const userModel = require('../models/authModal');

const userService = {
  // 관리자 가입 날짜와 일반 사용자 수 가져오기
  getAdminInfo: (callback) => {
    // 관리자 가입 날짜 가져오기
    userModel.getAdminDate((error, adminDate) => {
      if (error) return callback(error); // 에러 발생 시 콜백 호출
      // 일반 사용자 수 가져오기
      userModel.getUserCount((error, userCount) => {
        if (error) return callback(error); // 에러 발생 시 콜백 호출
        callback(null, { adminDate, userCount }); // 결과를 객체 형태로 반환
      });
    });
  }
};

module.exports = userService;
