const User = require('../models/userModal');
const Admin = require('../models/adminModal');
const bcrypt = require('bcrypt');
const { generateToken } = require('./tokenService'); // 토큰 생성 로직을 포함한 파일
const pool = require('../models/pool');
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
        if (!email) {
            throw new Error('이메일이 제공되지 않았습니다.');
        }

        try {
            const userExists = await User.checkEmailExists(email); // 사용자 테이블에서 이메일 확인
            const adminExists = await Admin.checkEmailExists(email); // 관리자 테이블에서 이메일 확인
            return userExists || adminExists; // 사용자 또는 관리자가 존재하면 true 반환
        } catch (error) {
            console.error('이메일 확인 오류:', error.message);
            throw new Error('이메일 확인 중 오류가 발생했습니다.');
        }
    }

    static async loginUser(email, password, isAdmin) {
        let user;
    
        try {
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
    
            // 비밀번호 비교
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new Error('비밀번호가 틀립니다.');
            }
    
            // JWT 토큰 생성
            const token = generateToken(user.email); 
            return { user, token };
    
        } catch (error) {
            console.error('로그인 처리 중 오류 발생:', error.message);
            throw error; // 오류를 외부로 전달
        }
    }
    
    // 로그아웃: Refresh Token 무효화
    static async invalidateRefreshToken(token) {
        try {
            await pool.execute('DELETE FROM sessions WHERE token = ?', [token]);
        } catch (error) {
            console.error('리프레시 토큰 무효화 오류:', error.message);
            throw new Error('리프레시 토큰 무효화 중 오류가 발생했습니다.');
        }
    }
}

module.exports = UserService;
