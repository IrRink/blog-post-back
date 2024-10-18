const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// 어드민 등록 라우트
router.post('/adduseroradmin', adminController.registerAdmin);
router.post('/login/admin', adminController.loginAdmin);
module.exports = router;
  