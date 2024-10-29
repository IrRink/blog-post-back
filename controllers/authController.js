// controllers/authController.js
const authService = require("../services/authServices");

const authController = {
  // 관리자 가입 날짜와 사용자 수를 클라이언트로 응답
  getAdminInfo: async (req, res) => {
    try {
      const { adminDate, userCount } = await authService.getAdminInfo(); // 관리자 가입 날짜와 사용자 수 가져오기
      res.status(200).json({ adminDate, userCount }); // 성공적으로 가져온 데이터 JSON 형식으로 응답
    } catch (error) {
      console.error("getAdminInfo 오류:", error); // 에러 콘솔 출력
      res.status(500).json({
        error: "서버에서 관리자 정보를 가져오는 중 오류가 발생했습니다.",
      }); // 서버 에러 응답
    }
  },
  // 관리자 이름가지고 오기
  getAdminName: async (req, res) => {
    try {
      const adminName = await authService.getAdminName(); // 관리자 이름 가져오기
      if (!adminName) {
        return res.status(404).json({ error: "관리자를 찾을 수 없습니다." }); // 관리자가 없을 경우
      }
      res.status(200).json(adminName); // 성공적으로 가져온 관리자 이름 반환
    } catch (error) {
      console.error("getAdminName 오류:", error);
      res.status(500).json({ error: "관리자 이름을 가져오는 중 오류 발생" }); // 에러 응답
    }
  },
  // 관리자 이메일 가지고 오기
  getAdminEmail: async (req, res) => {
    try {
      const adminEmail = await authService.getAdminEmail(); // 서비스에서 관리자 이메일 가져오기
      res.status(200).json(adminEmail); // 관리자 이메일을 JSON 형식으로 반환
    } catch (error) {
      console.error(error); // 에러 콘솔에 출력
      res.status(500).json({ error: "관리자 이메일을 가져오는 중 오류 발생" }); // 에러 응답
    }
  },
  verifyJwt: (req, res) => {
    res.status(200).json({ message: "토큰이 유효합니다.", user: req.user }); // 유효한 토큰에 대한 응답
  },
};

module.exports = authController;
