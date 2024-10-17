// controllers/userController.js
const userService = require('../services/authServices');

const userController = {
  // 관리자 가입 날짜와 사용자 수를 클라이언트로 응답
  getAdminInfo: (req, res) => {
    userService.getAdminInfo((error, data) => {
      if (error) {
        console.error(error); // 에러 콘솔 출력
        return res.status(500).json({ error: 'Internal Server Error' }); // 서버 에러 응답
      }
      res.json(data); // 성공적으로 가져온 데이터 JSON 형식으로 응답
    });
  }
};


module.exports = userController;
