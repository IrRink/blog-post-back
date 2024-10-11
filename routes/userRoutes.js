const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();

// 사용자 등록 라우트
router.post("/register", userController.registerUserController);

// 사용자 로그인 라우트
router.post("/login", userController.loginUserController);

// 모듈을 export할 때 pool을 매개변수로 받아서 사용할 수 있도록 합니다.
module.exports = (pool) => {
  // 필요한 경우, 라우트 핸들러에 pool을 전달할 수 있습니다.
  return router;
};
