// controllers/authController.js
const authService = require('../services/authServices');

const authController = {
  // 관리자 가입 날짜와 사용자 수를 클라이언트로 응답
  getAdminInfo: async (req, res) => {
    try {
      const data = await authService.getAdminInfo(); // 관리자 가입 날짜와 사용자 수 가져오기
      res.json(data); // 성공적으로 가져온 데이터 JSON 형식으로 응답
    } catch (error) {
      console.error(error); // 에러 콘솔 출력
      res.status(500).json({ error: 'Internal Server Error' }); // 서버 에러 응답
    }
  },
  getAdminName: async (req, res) => {
    try {
      const adminName = await authService.getAdminName(); // 서비스에서 이름 가져오기
      res.status(200).json( adminName ); // 성공적으로 가져온 관리자 이름 반환
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: '관리자 이름을 가져오는 중 오류 발생' }); // 에러 응답
    }
  },
  getAdminEmail:async(req,res)=>{
    try {
      const adminEmail = await authService.getAdminEmail(); // 서비스에서 이름 가져오기
      res.status(200).json( adminEmail ); // 성공적으로 가져온 관리자 이름 반환
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: '관리자 이름을 가져오는 중 오류 발생' }); // 에러 응답
    }
  },
};

module.exports = authController;
