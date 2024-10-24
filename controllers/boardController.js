const {
  writingBoard,
  checkBoard,
  checkIdBoard,
  retouchBoard,
  removeBoard,
} = require("../services/boardServices");

//게시글 작성
exports.writingBoard = async (req, res) => {
  const { title, sub_title, board_text } = req.body;

  const userId = req.user;

  try {
    await writingBoard(title, sub_title, board_text, userId);
    res.status(201).json({ message: "게시물이 성공적으로 추가되었습니다!" });
  } catch (error) {
    console.error("게시물 추가 중 오류 발생:", error);
    res.status(500).json({ message: "게시물 추가 중 오류가 발생했습니다." });
  }
};

//게시글 전체 조회
exports.checkBoard = async (req, res) => {
  try {
    const posts = await checkBoard();
    res.json(posts);
  } catch (error) {
    console.error("게시물 조회 중 오류 발생:", error);
    res.status(500).json({ message: "게시물 조회 중 오류가 발생했습니다." });
  }
};

//게시글 하나만 조회
exports.checkIdBoard = async (req, res) => {
  const num = req.params.num;

  try {
    const post = await checkIdBoard(num);
    res.json(post);
  } catch (error) {
    console.error("게시물 조회 중 오류 발생:", error);
    res.status(500).json({ message: "게시물 조회 중 오류가 발생했습니다." });
  }
};

//게시글 수정
exports.retouchBoard = async (req, res) => {
  const num = req.params.num;
  const { title, sub_title, board_text } = req.body;

  try {
    await retouchBoard(num, title, sub_title, board_text);
    res.json("게시물이 성공적으로 업데이트되었습니다!");
  } catch (error) {
    console.error("게시물 업데이트 중 오류 발생:", error);
    res.status(400).json({ message: error.message || "게시물 업데이트 중 오류가 발생했습니다." });
  }
};

//게시글 삭제
exports.removeBoard = async (req, res) => {
  const num = req.params.num;

  try {
    await removeBoard(num);
    res.json({ message: "게시물이 성공적으로 삭제되었습니다!" });
  } catch (error) {
    console.error("게시물 삭제 중 오류 발생:", error);
    res.status(500).json({ message: "게시물 삭제 중 오류가 발생했습니다." });
  }
};
