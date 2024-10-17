const UserService = require('../services/userServices');

exports.registerUser = async (req, res) => {
  const { email, name, age, password } = req.body;

  try {
      const user = await UserService.registerUser(email, name, age, password);
      res.status(201).json({ message: '회원가입 성공', user });
  } catch (error) {
      console.error('회원가입 오류:', error.message);
      res.status(400).json({ error: error.message }); // 400 Bad Request
  }
};

exports.loginUser = async (req, res) => {
  const { email, password, isAdmin } = req.body;

  try {
      // UserService에서 반환되는 객체 구조에 맞게 수정
      const { account, tokens } = await UserService.loginUser(email, password, isAdmin);
      const { accessToken, refreshToken } = tokens;

      if (isAdmin) {
          // 관리자가 로그인한 경우
          res.status(200).json({ message: '관리자 로그인 성공', accessToken, refreshToken, admin: account });
      } else {
          // 사용자가 로그인한 경우
          res.status(200).json({ message: '유저 로그인 성공', accessToken, refreshToken, user: account });
      }
  } catch (error) {
      console.error('로그인 오류:', error.message); // 더 구체적인 오류 메시지 출력
      res.status(401).json({ error: error.message }); // 401 Unauthorized
  }
};


exports.logoutUser = async (req, res) => {
    const { refreshToken } = req.body; // 클라이언트로부터 Refresh Token을 받음

    try {
        if (!refreshToken) {
            return res.status(400).json({ error: '리프레시 토큰이 필요합니다.' });
        }

        // Refresh Token 무효화 로직
        await UserService.invalidateRefreshToken(req.user.id, refreshToken);
        res.status(200).json({ message: '로그아웃 성공' });
    } catch (error) {
        console.error('로그아웃 오류:', error);
        res.status(500).json({ error: '서버 오류 발생' });
    }
};