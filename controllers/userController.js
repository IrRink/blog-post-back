const UserService = require('../services/userServices'); // UserService 모듈을 불러옴

// 회원가입 함수
exports.registerUser = async (req, res) => {
    // 클라이언트 요청에서 email, name, age, password 추출
    const { email, name, age, password } = req.body;

    // 입력 값 검증: 모든 필드가 채워졌는지 확인
    if (!email || !name || !age || !password) {
        // 필드가 비어있으면 400 상태 코드와 에러 메시지 응답
        return res.status(400).json({ error: '모든 필드를 입력해야 합니다.' });
    }

    try {
        // UserService를 통해 사용자 등록 처리
        const user = await UserService.registerUser(email, name, age, password);
        // 성공 시 201 상태 코드와 성공 메시지 응답
        res.status(201).json({ message: '회원가입 성공' });
    } catch (error) {
        // 에러 발생 시 오류 메시지를 콘솔에 출력하고 400 상태 코드 응답
        console.error('회원가입 오류:', error.message);
        res.status(400).json({ error: error.message }); // 400 Bad Request
    }
};

// 유저 로그인 함수
exports.loginUser = async (req, res) => {
    // 클라이언트 요청에서 email과 password 추출
    const { email, password } = req.body;

    try {
        // UserService의 loginUser 함수를 통해 로그인 처리 (false는 일반 유저임을 나타냄)
        const { user, token } = await UserService.loginUser(email, password, false);
        // 로그인 성공 시 200 상태 코드와 로그인 성공 메시지, 토큰, 사용자 정보 응답
        res.status(200).json({ message: '유저 로그인 성공', token, user });
    } catch (error) {
        // 로그인 실패 시 오류 메시지를 콘솔에 출력하고 401 상태 코드와 에러 메시지 응답
        console.error('로그인 오류:', error.message);
        res.status(401).json({ error: error.message });
    }
};

// 로그아웃 함수: Refresh Token 무효화 (세션 미사용)
exports.logoutUser = async (req, res) => {
    // 클라이언트 요청 헤더에서 authorization 토큰 추출
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // 'Bearer token'에서 토큰만 추출

    // 토큰이 없으면 401 상태 코드와 에러 메시지 응답
    if (!token) {
        return res.status(401).json({ error: '토큰이 필요합니다.' });
    }

    try {
        // 로그아웃 시도 중 콘솔에 토큰 출력
        console.log('로그아웃 시도 중, 토큰:', token);
        // 로그아웃 성공 시 200 상태 코드와 성공 메시지 응답
        res.status(200).json({ message: '로그아웃 성공' });
    } catch (error) {
        // 로그아웃 중 에러 발생 시 전체 오류 콘솔 출력하고 500 상태 코드 응답
        console.error('로그아웃 오류:', error);
        res.status(500).json({ error: '로그아웃 중 오류가 발생했습니다.' });
    }
};

// 이메일 중복 확인 함수
exports.checkEmail = async (req, res) => {
    // 클라이언트 요청에서 email 추출 (query 파라미터로 전달됨)
    const { email } = req.query;
    
    try {
        // UserService를 통해 이메일 존재 여부 확인
        const exists = await UserService.checkEmailExists(email);
        // 이메일 존재 여부를 200 상태 코드와 함께 응답
        res.status(200).json({ exists });
    } catch (error) {
        // 에러 발생 시 오류 메시지를 콘솔에 출력하고 500 상태 코드와 에러 메시지 응답
        console.error('이메일 확인 오류:', error.message);
        res.status(500).json({ error: error.message }); 
    }
};

exports.updateProfile = async (req, res) => {
    const userEmail = req.user.email; // 요청 객체에서 이메일 가져오기
    const userData = req.body; // 요청 본문에서 사용자 데이터 가져오기

    try {
        await UserService.updateUser(userEmail, userData); // 사용자 정보 업데이트
        res.status(200).send('사용자 정보가 성공적으로 업데이트되었습니다.');
    } catch (error) {
        console.error('사용자 정보 업데이트 오류:', error.message);
        res.status(500).send('사용자 정보 업데이트 중 오류가 발생했습니다.');
    }
};

exports.deleteAccount = async (req, res) => {
    const userEmail = req.user.email; // 사용자의 이메일을 가져옴 (JWT에서 가져오거나 세션에서 가져올 수 있음)

    try {
        await UserService.deleteUser(userEmail); // UserService를 통해 사용자 삭제 처리
        res.status(200).json({ message: '회원 탈퇴가 완료되었습니다.' });
    } catch (error) {
        console.error('회원 탈퇴 오류:', error.message);
        res.status(400).json({ error: error.message });
    }
};