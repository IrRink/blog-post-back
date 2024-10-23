// services/authServices.js
const authModel = require('../models/authModal');

const authService = {
  // 관리자 가입 날짜와 일반 사용자 수 가져오기
  getAdminInfo: async () => {
    try {
      const adminDate = await authModel.getAdminDate(); // 관리자 가입 날짜 가져오기
      const userCount = await authModel.getUserCount(); // 일반 사용자 수 가져오기
      return { adminDate, userCount }; // 결과를 객체 형태로 반환
    } catch (error) {
      throw error; // 에러 발생 시 throw로 전달
    }
  },

  // 관리자 이름 가져오기
  getAdminName: async () => {
    try {
      const adminName = await authModel.getAdminName(); // 모델에서 이름 가져오기
      return adminName;
    } catch (error) {
      throw error; // 에러 발생 시 throw로 전달
    }
  },
  getAdminEmail: async () => {
    const adminEmail = await authModel.getAdminEmail(); // 관리자 이메일 가져오기
    return adminEmail;
  },
};

module.exports = authService;
