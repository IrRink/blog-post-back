const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 유저 등록 라우트
router.post('/adduseroruser', userController.registerUser);

router.post('/login', userController.loginUser);
router.post('/logout', userController.logoutUser);
router.post('/checkemail', userController.checkEmail);

module.exports = router;


