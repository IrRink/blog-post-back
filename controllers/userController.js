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
        const { user, tokens } = await UserService.loginUser(email, password, isAdmin);
        const { accessToken, refreshToken } = tokens;

        if (isAdmin) {
            res.status(200).json({ message: '관리자 로그인 성공', accessToken, refreshToken, admin: user });
        } else {
            res.status(200).json({ message: '유저 로그인 성공', accessToken, refreshToken, user });
        }
    } catch (error) {
        console.error('로그인 오류:', error.message);
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

exports.checkEmail = async (req, res) => {
    const { email } = req.body;

    try {
        // 이메일 존재 여부 확인
        const exists = await UserService.checkEmailExists(email);
        res.status(200).json({ exists });
    } catch (error) {
        console.error('이메일 확인 오류:', error.message);
        res.status(500).json({ error: error.message });
    }
};
