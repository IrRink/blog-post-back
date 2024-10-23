const Admin = require('../models/adminModal'); // Admin 모델 가져오기

class AdminService {
    // 관리자 등록
    static async registerAdmin(email, name, age, password) {
        // 관리자 존재 여부 확인
        const adminExists = await Admin.exists();
        if (adminExists) {
            throw new Error('이미 관리자가 등록되어 있습니다.'); // 관리자가 존재하면 등록 금지
        }

        // 이메일 중복 확인
        const existingUser = await Admin.checkEmailExists(email);
        if (existingUser) {
            throw new Error('이미 존재하는 이메일입니다.'); // 이메일이 존재하면 오류 반환
        }

        // 비밀번호 해싱 처리 후 관리자 생성
        return await Admin.create(email, name, age, password);
    }
}

module.exports = AdminService;
