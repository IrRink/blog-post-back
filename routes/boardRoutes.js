const express = require("express");
const router = express.Router();
const boardController = require("../controllers/boardController");

// 게시물 저장
router.post("/", boardController.boardWriting);

// 게시물 조회
router.get("/", boardController.boardCheck);

// 개별 게시물 조회
router.get("/:num", boardController.boardNumCheck);

// 게시물 업데이트
router.put("/:num", boardController.boardRetouch);

// 게시물 삭제
router.delete("/:num", boardController.boardRemove);

module.exports = router;
