// userController.js
const UserService = require('../services/userServices');

exports.registerUser = async (req, res) => {
    const { email, name, age, password } = req.body;
    try {
        const user = await UserService.registerUser(email, name, age, password);
        res.status(201).json({ message: '회원가입 성공' });
    } catch (error) {
        console.error('회원가입 오류:', error.message);
        res.status(400).json({ error: error.message }); // 400 Bad Request
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const { user, token } = await UserService.loginUser(email, password, false);
        res.status(200).json({ message: '유저 로그인 성공', token, user });
    } catch (error) {
        console.error('로그인 오류:', error.message);
        res.status(401).json({ error: error.message });
    }
};

exports.logoutUser = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // 'Bearer token'에서 토큰만 추출

    if (!token) {
        return res.status(401).json({ error: '토큰이 필요합니다.' });
    }

    try {
        await UserService.invalidateRefreshToken(token); // 리프레시 토큰 무효화
        res.status(200).json({ message: '로그아웃 성공' });
    } catch (error) {
        console.error('로그아웃 오류:', error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.checkEmail = async (req, res) => {
    const { email } = req.query; // 쿼리 파라미터에서 이메일 가져오기
    try {
        const exists = await UserService.checkEmailExists(email); // UserService의 메서드 호출
        res.status(200).json({ exists });
    } catch (error) {
        console.error('이메일 확인 오류:', error.message); // 오류 메시지 출력
        res.status(500).json({ error: error.message });
    }
};
