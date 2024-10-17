const Admin = require('../models/adminModal');

class AdminService {
    static async registerAdmin(email, name, age, password) {
        const adminExists = await Admin.exists();
        if (adminExists) {
            throw new Error('이미 어드민이 등록되어 있습니다.');
        }
        return await Admin.create(email, name, age, password);
    }
}

module.exports = AdminService;
