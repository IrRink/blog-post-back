const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// 어드민 등록 라우트
router.post('/adduseroradmin', adminController.registerAdmin);

module.exports = router;
