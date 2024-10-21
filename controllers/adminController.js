const AdminService = require('../services/adminServices');
const UserService = require('../services/userServices');

exports.registerAdmin = async (req, res) => {
    const { email, name, age, password } = req.body;

    try {
        await AdminService.registerAdmin(email, name, age, password);
        res.status(201).json({ message: '어드민 등록 성공' });
    } catch (error) {
        console.error('어드민 등록 오류:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const { user, token } = await UserService.loginUser(email, password, true);
        res.status(200).json({ message: '관리자 로그인 성공', token, admin: user });
    } catch (error) {
        console.error('로그인 오류:', error.message);
        res.status(401).json({ error: error.message }); // 에러 메시지 반환
    }
};
