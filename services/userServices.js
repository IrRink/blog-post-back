// services/userService.js
const bcrypt = require('bcrypt');

const { checkEmailExists, insertUser, insertAdmin } = require('../models/userModal');

const addUserService = async (email, name, age, password, isAdmin) => {
    // 이메일 중복 체크
    const existingUser = await checkEmailExists(email);
    if (existingUser) {
        throw new Error("이미 사용 중인 이메일입니다.");
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    if (isAdmin) {
        // 관리자 등록 로직
        const hasExistingAdmin = await checkEmailExists(email); // 관리자 존재 여부 확인
        if (hasExistingAdmin) {
            throw new Error("이미 관리자 계정이 존재합니다.");
        }
        await insertAdmin(email, name, age, hashedPassword);
    } else {
        // 사용자 등록 로직
        await insertUser(email, name, age, hashedPassword);
    }

    return "계정이 성공적으로 등록되었습니다.";
};

module.exports = {
    addUserService,
};

