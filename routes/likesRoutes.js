const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middlewares/authenticateJWT');
const likesController = require('../controllers/likesController');

// 좋아요 추가 및 삭제
router.post('/', authenticateJWT, likesController.switchLike);

// 특정 게시물/댓글의 좋아요 수 조회
router.get('/:target_type/:target_id', likesController.checkLikeCount);

module.exports = router;
