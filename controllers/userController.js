const UserService = require('../services/userServices');
exports.registerUser = async (req, res) => {
    const { email, name, age, password } = req.body;

    // 입력 값 검증
    if (!email || !name || !age || !password) {
        return res.status(400).json({ error: '모든 필드를 입력해야 합니다.' });
    }

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

// 로그아웃: Refresh Token 무효화 (세션 미사용)
exports.logoutUser = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // 'Bearer token'에서 토큰만 추출

    if (!token) {
        return res.status(401).json({ error: '토큰이 필요합니다.' });
    }

    try {
        console.log('로그아웃 시도 중, 토큰:', token); // 토큰 로깅
        res.status(200).json({ message: '로그아웃 성공' });
    } catch (error) {
        console.error('로그아웃 오류:', error); // 전체 오류 로깅
        res.status(500).json({ error: '로그아웃 중 오류가 발생했습니다.' });
    }
};


exports.checkEmail = async (req, res) => {
    const { email } = req.query;
    try {
        const exists = await UserService.checkEmailExists(email); // 이메일 존재 여부 확인
        res.status(200).json({ exists }); // 존재 여부를 포함하여 응답
    } catch (error) {
        console.error('이메일 확인 오류:', error.message);
        res.status(500).json({ error: error.message });
    }
};
