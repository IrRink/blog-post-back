// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { refreshToken } = require("../controllers/tokenController");
const userController = require("../controllers/userController");
const authenticateJWT = require("../middlewares/authenticateJWT");
// 관리자 가입 날짜와 사용자 수를 가져오는 GET 라우트
router.get("/adminAndUserCount", authController.getAdminInfo);
router.get("/adminname", authController.getAdminName);
router.get("/adminEmail", authController.getAdminEmail);
// Refresh Token 라우트
router.post("/refresh-token", refreshToken);
router.get("/auth", userController.getUserInfo);
router.delete("/auth", authenticateJWT, userController.deleteUser);
router.put("/auth", authenticateJWT, userController.updateUser);
router.post("/auth", userController.resetPassword); // 비밀번호 재설정 라우트
router.post("/forget", userController.findEmail);
module.exports = router;
