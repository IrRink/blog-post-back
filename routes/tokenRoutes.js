const express = require('express');
const { refreshToken } = require('../controllers/tokenController');

const router = express.Router();

// Refresh Token 라우트
router.post('/refresh-token', refreshToken);

module.exports = router;