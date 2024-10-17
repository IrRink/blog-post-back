const User = require('../models/userModal');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModal'); 

class UserService {
  // 사용자 등록
  static async registerUser(email, name, age, password) {
      // 이미 존재하는 유저 확인
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
          throw new Error('이미 존재하는 이메일입니다.'); // 중복된 이메일에 대한 오류 발생
      }
      return await User.create(email, name, age, password);
  }
  // 로그인
  static async loginUser(email, password, isAdmin) {
      let user; // 사용자 또는 관리자 정보를 담을 변수
      if (isAdmin) {
          // 관리자 로그인 처리
          user = await Admin.findByEmail(email);
          if (!user) {
              throw new Error('관리자가 존재하지 않습니다.');
          }
      } else {
          // 일반 사용자 로그인 처리
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
      const accessToken = jwt.sign({ id: user.id, role: isAdmin ? 'admin' : 'user' }, process.env.JWT_SECRET, { expiresIn: '15m' });
      const refreshToken = jwt.sign({ id: user.id, role: isAdmin ? 'admin' : 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });

      // 바디에 담아 반환
      return {
          user, 
          admin: isAdmin ? user : null, 
          tokens: {
              accessToken, 
              refreshToken
          }
      }; 
  }

  // 로그아웃: Refresh Token 무효화 (저장 없이 처리)
  static async invalidateRefreshToken() {
      // 리프레시 토큰 무효화 로직 (필요시 구현)
  }
}

module.exports = UserService;


