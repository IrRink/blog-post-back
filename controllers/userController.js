const UserService = require("../services/userServices"); // UserService 모듈을 불러옴

// 회원가입 함수
exports.registerUser = async (req, res) => {
  const { email, name, age, password } = req.body;

  try {
    await UserService.registerUser(email, name, age, password); // role은 기본값으로 'user'
    res.status(201).json("회원가입 성공");
  } catch (error) {
    console.error("회원가입 오류:", error.message);
    res.status(400).json({ error: error.message });
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
    res.status(200).json({ message: "유저 로그인 성공", token, user });
  } catch (error) {
    // 로그인 실패 시 오류 메시지를 콘솔에 출력하고 401 상태 코드와 에러 메시지 응답
    console.error("로그인 오류:", error.message);
    res.status(401).json({ error: error.message });
  }
};

// 로그아웃 함수: Refresh Token 무효화 (세션 미사용)
exports.logoutUser = async (req, res) => {
  // 클라이언트 요청 헤더에서 authorization 토큰 추출
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // 'Bearer token'에서 토큰만 추출

  // 토큰이 없으면 401 상태 코드와 에러 메시지 응답
  if (!token) {
    return res.status(401).json({ error: "토큰이 필요합니다." });
  }

  try {
    // 로그아웃 시도 중 콘솔에 토큰 출력
    console.log("로그아웃 시도 중, 토큰:", token);
    // 로그아웃 성공 시 200 상태 코드와 성공 메시지 응답
    res.status(200).json({ message: "로그아웃 성공" });
  } catch (error) {
    // 로그아웃 중 에러 발생 시 전체 오류 콘솔 출력하고 500 상태 코드 응답
    console.error("로그아웃 오류:", error);
    res.status(500).json({ error: "로그아웃 중 오류가 발생했습니다." });
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
    console.error("이메일 확인 오류:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    const user = await UserService.getUserInfo(req); // req를 전달하여 서비스에서 토큰 추출
    res.status(200).json({ message: "사용자 정보 조회 성공", user });
  } catch (error) {
    console.error("사용자 정보 조회 중 오류 발생:", error.message);

    // 인증 실패에 따른 403 에러 처리
    if (error.message.includes("유효하지 않은 토큰입니다.")) {
      return res.status(403).json({ message: "토큰이 만료되었습니다." });
    }

    // 사용자 찾기 실패에 따른 404 에러 처리
    if (error.message.includes("사용자를 찾을 수 없습니다.")) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 기본적인 오류 처리 (기타 오류에 대해 500 상태 코드 반환)
    res.status(500).json({ message: "서버에서 오류가 발생했습니다." });
  }
};

exports.updateUser = async (req, res) => {
  const currentEmail = req.email; // 토큰에서 추출된 이메일
  const userData = req.body; // 사용자 요청 데이터 (수정할 데이터)

  console.log("수정할 데이터:", userData);

  try {
    const updatedUser = await UserService.updateUserInfo(
      currentEmail,
      userData
    );
    res.status(200).json({
      message: "사용자 정보가 성공적으로 수정되었습니다. 다시 로그인해주세요.",
    });
  } catch (error) {
    console.error("사용자 정보 수정 중 오류 발생:", error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  const currentEmail = req.email; // 토큰에서 추출된 이메일
  console.log("삭제 요청된 이메일:", currentEmail); // 이메일 로그 추가

  if (!currentEmail) {
    return res.status(400).json({ error: "이메일이 필요합니다." });
  }

  try {
    const result = await UserService.deleteUser(currentEmail);
    res.status(200).json({
      message: "회원 정보가 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    console.error("회원 정보 삭제 중 오류 발생:", error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const temporaryPassword = await UserService.resetPassword(email);
    res.status(200).json({
      message: "임시 비밀번호가 생성되었습니다.",
      temporaryPassword,
    });
  } catch (error) {
    console.error("비밀번호 재설정 중 오류 발생:", error.message);
    res.status(404).json({ error: error.message });
  }
};
