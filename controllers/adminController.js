const AdminService = require('../services/adminServices'); // AdminService 모듈을 불러옴
const UserService = require('../services/userServices'); // UserService 모듈을 불러옴

// 어드민 등록 함수
exports.registerAdmin = async (req, res) => {
    // 클라이언트 요청에서 email, name, age, password 추출
    const { email, name, age, password } = req.body;

    try {
        // AdminService를 통해 어드민 등록 로직 실행
        await AdminService.registerAdmin(email, name, age, password);
        // 등록 성공 시 201 상태 코드와 성공 메시지 응답
        res.status(201).json({ message: '어드민 등록 성공' });
    } catch (error) {
        // 에러 발생 시 오류 메시지를 콘솔에 출력하고 400 상태 코드와 에러 메시지 응답
        console.error('어드민 등록 오류:', error);
        res.status(400).json({ message: error.message });
    }
};

// 어드민 로그인 함수
exports.loginAdmin = async (req, res) => {
    // 클라이언트 요청에서 email과 password 추출
    const { email, password } = req.body;

    try {
        // UserService의 loginUser 함수를 통해 로그인 처리 (true는 어드민임을 나타냄)
        const { user, token } = await UserService.loginUser(email, password, true);
        // 로그인 성공 시 200 상태 코드와 로그인 성공 메시지, 토큰, 어드민 정보 응답
        res.status(200).json({ message: '관리자 로그인 성공', token, admin: user });
    } catch (error) {
        // 로그인 실패 시 오류 메시지를 콘솔에 출력하고 401 상태 코드와 에러 메시지 응답
        console.error('로그인 오류:', error.message);
        res.status(401).json({ error: error.message });
    }
};
