const express = require('express');
const { addUserController } = require('../controllers/userController');
const router = express.Router();

// 회원가입 경로 설정
router.post('/signup', addUserController);

module.exports = router;
