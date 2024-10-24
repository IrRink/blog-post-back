const express = require("express");
const router = express.Router();
const boardController = require("../controllers/boardController");
// const authenticateJWT = require("../middlewares/authenticateJWT");

// 게시물 저장
// router.post("/", authenticateJWT, boardController.writingBoard);
router.post("/", boardController.writingBoard);
// 게시물 조회
router.get("/", boardController.checkBoard);

// 개별 게시물 조회
router.get("/:num", boardController.checkIdBoard);

// 게시물 업데이트
router.put("/:num", boardController.retouchBoard);

// 게시물 삭제
router.delete("/:num", boardController.removeBoard);

module.exports = router;
