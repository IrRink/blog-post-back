// routes/userRoutes.js

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController"); // 소문자 사용
const authenticateJWT = require("../middlewares/authenticateJWT");
// 유저 등록 라우트
router.post("/signup", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/logout", userController.logoutUser);
router.get("/checkEmail", userController.checkEmail); // 수정된 부분

router.put("/updateProfile", authenticateJWT, userController.updateUser);
module.exports = router;
