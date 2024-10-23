const User = require('../models/userModal');
const bcrypt = require('bcrypt');
const { generateToken } = require('./tokenService'); // 토큰 생성 로직을 포함한 파일
const pool = require('../models/pool');

class UserService {
    // 사용자 등록
    static async registerUser(email, name, age, password, role) {
        // 필수 필드가 비어있는지 확인
        if (!email || !name || !age || !password) {
            throw new Error('필수 필드가 비어 있습니다.');
        }
    
        // 이메일 중복 확인
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            throw new Error('이미 존재하는 이메일입니다.');
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // role이 주어지지 않으면 기본값 'user'로 설정
        const userRole = role || 'user';

        // 유저 생성
        return await User.create(email, name, age, hashedPassword, userRole);
    }

    // 이메일 존재 여부 확인
    static async checkEmailExists(email) {
        if (!email) {
            throw new Error('이메일이 제공되지 않았습니다.');
        }

        try {
            const userExists = await User.checkEmailExists(email); // 사용자 테이블에서 이메일 확인
            return userExists; 
        } catch (error) {
            console.error('이메일 확인 오류:', error.message);
            throw new Error('이메일 확인 중 오류가 발생했습니다.');
        }
    }
    
    // 사용자 정보 업데이트
    static async updateUser(email, data) {
        await User.updateUser(email, data); 
    }

    // 사용자 로그인
    static async loginUser(email, password, isAdmin) {
        let user;
    
        try {
            // 사용자 테이블에서 이메일 조회
            user = await User.findByEmail(email);
            if (!user) {
                throw new Error('사용자가 없거나, 이메일이 잘못되었습니다.');
            }
    
            // 관리자로 로그인하는 경우 role이 'admin'인지 확인
            if (isAdmin) {
                if (user.role !== 'admin') {
                    throw new Error('어드민 권한이 없습니다.');
                }
            } else {
                // 체크박스가 선택되지 않은 경우 관리자가 아닌 일반 사용자로 로그인하도록 제한
                if (user.role === 'admin') {
                    throw new Error('관리자로그인을 선택하지 않으셨습니다. 관리자 계정으로 로그인할 수 없습니다.');
                }
            }
    
            // 비밀번호 비교
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new Error('비밀번호가 틀립니다.');
            }
    
            // 토큰 생성
            const token = generateToken(user.email);
            return { user, token };
    
        } catch (error) {
            console.error('로그인 처리 중 오류 발생:', error.message);
            throw error; 
        }
    }
    
    // 로그아웃 기능
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
