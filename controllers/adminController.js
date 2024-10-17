const AdminService = require('../services/adminServices');

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
