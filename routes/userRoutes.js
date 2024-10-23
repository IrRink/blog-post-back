// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // 소문자 사용
const authenticateJWT = require('../middlewares/authenticateJWT');
// 유저 등록 라우트
router.post('/signup', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/logout', userController.logoutUser);
router.get('/checkEmail', userController.checkEmail); // 수정된 부분
router.get('/profile', authenticateJWT, (req, res) => {
  res.send({ user: req.user }); // 인증된 사용자 정보 반환
});
router.delete('/deleteAccount', userController.deleteAccount);
router.put('/updateProfile', authenticateJWT, userController.updateProfile);
module.exports = router;
