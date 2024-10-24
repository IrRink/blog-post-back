const {
  insertBoard,
  selectBoard,
  selectIdBoard,
  updateBoard,
  deleteBoard,
} = require("../models/boardModels");


exports.writingBoard = async (req, res) => {
  const { title, sub_title, board_text } = req.body;

  const userId = req.user;

  if (!title || !sub_title || !board_text) {
    return res.status(400).json({ message: "모든 필드를 입력해야 합니다." });
  }

  try {
    await insertBoard(title, sub_title, board_text, userId);
    res.status(201).json({ message: "게시물이 성공적으로 추가되었습니다!" });
  } catch (error) {
    console.error("게시물 추가 중 오류 발생:", error);
    res.status(500).json({ message: "게시물 추가 중 오류가 발생했습니다." });
  }
};

exports.checkBoard = async (req, res) => {
  try {
    const posts = await selectBoard();
    res.json(posts);
  } catch (error) {
    console.error("게시물 조회 중 오류 발생:", error);
    res.status(500).json({ message: "게시물 조회 중 오류가 발생했습니다." });
  }
};

exports.checkIdBoard = async (req, res) => {
  const num = req.params.num;

  try {
    const post = await selectIdBoard(num);
    if (!post) {
      return res.status(404).json({ message: "게시물을 찾을 수 없습니다." });
    }
    res.json(post);
  } catch (error) {
    console.error("게시물 조회 중 오류 발생:", error);
    res.status(500).json({ message: "게시물 조회 중 오류가 발생했습니다." });
  }
};

exports.retouchBoard = async (req, res) => {
  const num = req.params.num;
  const { title, sub_title, board_text } = req.body;

  if (!title || !sub_title || !board_text) {
    return res.status(400).json({ message: "모든 필드를 입력해야 합니다." });
  }

  try {
    await updateBoard(num, title, sub_title, board_text);
    res.json("게시물이 성공적으로 업데이트되었습니다!");
  } catch (error) {
    console.error("게시물 업데이트 중 오류 발생:", error);
    res
      .status(500)
      .json({ message: "게시물 업데이트 중 오류가 발생했습니다." });
  }
};

exports.removeBoard = async (req, res) => {
  const num = req.params.num;

  try {
    await deleteBoard(num);
    res.json({ message: "게시물이 성공적으로 삭제되었습니다!" });
  } catch (error) {
    console.error("게시물 삭제 중 오류 발생:", error);
    res.status(500).json({ message: "게시물 삭제 중 오류가 발생했습니다." });
  }
};
