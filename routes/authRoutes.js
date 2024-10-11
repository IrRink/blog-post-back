const express = require('express');
const userService = require("../services/userServices");
const adminService = require("../services/adminServices");
const { login, logout, checkSession } = require('../services/authServices');
const authController = require("../controllers/authController");
const router = express.Router();

// // 로그인 라우트
// router.post('/login/:role?', login(pool)); // 로그인 처리
// router.post('/logout', logout); // 로그아웃 처리
// router.get('/session', checkSession); // 세션 체크


module.exports = (pool) => {
    return router;
};