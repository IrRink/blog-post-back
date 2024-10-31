const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middlewares/authenticateJWT');
const likesController = require('../controllers/likesController');

// boardtable 좋아요 추가 및 삭제
router.post('/boards/:boardid', authenticateJWT, likesController.switchBoardLike);

// comment 좋아요 추가 및 삭제
router.post('/comments/:commentid', authenticateJWT, likesController.switchCommentLike);

// boardtable 게시물/댓글의 좋아요 수 조회
router.get('/boards/:boardid', likesController.checkBoardLikeCount);

// comment 게시물/댓글의 좋아요 수 조회
router.get('/comments/:commentid', likesController.checkCommentLikeCount);

// 내가 고른 좋아요 모음
router.get('/my-likes', authenticateJWT,likesController.checkLikeCollection);

module.exports = router;
