// userService.js
const User = require('../models/userModal');
const bcrypt = require('bcrypt');
const Admin = require('../models/adminModal');
const { generateToken } = require('./tokenService'); // 토큰 생성 로직을 포함한 파일

class UserService {
    // 사용자 등록
    static async registerUser(email, name, age, password) {
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            throw new Error('이미 존재하는 이메일입니다.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        return await User.create(email, name, age, hashedPassword);
    }
    
    // 이메일 존재 여부 확인
    static async checkEmailExists(email) {
        try {
            const userRows = await User.findByEmail(email); // 이메일로 사용자 조회
            const adminRows = await Admin.findByEmail(email); // 이메일로 관리자 조회
            return userRows || adminRows ? true : false; // 사용자나 관리자가 존재하면 true 반환
        } catch (error) {
            console.error('이메일 확인 오류:', error.message);
            throw new Error('이메일 확인 중 오류가 발생했습니다.');
        }
    }

    // 로그인 처리
    static async loginUser(email, password, isAdmin) {
        let user;
        if (isAdmin) {
            user = await Admin.findByEmail(email);
            if (!user) {
                throw new Error('관리자가 존재하지 않습니다.');
            }
        } else {
            user = await User.findByEmail(email);
            if (!user) {
                throw new Error('유저가 존재하지 않습니다.');
            }
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('비밀번호가 틀립니다.');
        }

        // JWT 토큰 생성
        const token = generateToken(user.id, isAdmin); // 사용자 ID와 isAdmin 정보를 사용하여 토큰 생성
        return { user, token }; // 사용자 및 토큰 반환
    }

    // 로그아웃: Refresh Token 무효화 (저장 없이 처리)
    static async invalidateRefreshToken(token) {
        try {
            // 여기서 sessions 테이블을 가정하고 토큰을 삭제
            await pool.execute('DELETE FROM sessions WHERE token = ?', [token]);
        } catch (error) {
            console.error('리프레시 토큰 무효화 오류:', error.message);
            throw new Error('리프레시 토큰 무효화 중 오류가 발생했습니다.');
        }
    }
}

module.exports = UserService;
