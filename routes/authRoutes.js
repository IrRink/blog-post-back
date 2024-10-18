// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 관리자 가입 날짜와 사용자 수를 가져오는 GET 라우트
router.get('/adminAndUserCount', authController.getAdminInfo);
router.get('/adminname/', authController.getAdminName);
module.exports = router;
