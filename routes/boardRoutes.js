const express = require("express");
const router = express.Router();
const boardController = require("../controllers/boardController");
const authenticateJWT = require("../middlewares/authenticateJWT");
const { validateBoard } = require("../middlewares/validationMiddlewares");

// 게시물 저장
router.post("/", authenticateJWT, boardController.insertBoard);

// 게시물 전체 조회
router.get("/", boardController.selectBoard);

// 개별 게시물 조회
router.get("/:num", boardController.selectIdBoard);

// 게시물 수정
router.put("/:num", authenticateJWT, validateBoard, boardController.updateBoard);

// 게시물 삭제
router.delete("/:num", authenticateJWT, boardController.deleteBoard);

module.exports = router;
