const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// 어드민 등록 라우트
router.post('/signup', adminController.registerAdmin);
router.post('/login', adminController.loginAdmin);
module.exports = router;
  