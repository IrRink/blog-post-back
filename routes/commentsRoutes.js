const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentsController");
const authenticateJWT = require("../middlewares/authenticateJWT");

// 댓글 작성
router.post("/:boardId", authenticateJWT, commentController.writeComment);

// 게시물 댓글 조회
router.get("/:boardId", commentController.getComments);

// 댓글 수정
router.put("/:commentId", authenticateJWT, commentController.editComment);

// 댓글 삭제
router.delete("/:commentId", authenticateJWT, commentController.deleteComment);

module.exports = router;
