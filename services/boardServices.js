const { insertBoard, selectBoard, selectIdBoard, updateBoard, deleteBoard } = require("../models/boardModels");

// 게시물 저장
const writingBoard = async (title, sub_title, board_text, userId) => {
    await insertBoard(title, sub_title, board_text, userId);
};

// 게시물 전체 조회
const checkBoard = async () => {
    return await selectBoard();
};

// 개별 게시물 조회
const checkIdBoard = async (num) => {
    const post = await selectIdBoard(num);
    if (!post) {
        throw new Error("게시물을 찾을 수 없습니다.");
    }
    return post;
};

// 게시물 수정
const editBoard = async (num, title, sub_title, board_text) => {
    await updateBoard(num, title, sub_title, board_text);
};

// 게시물 삭제
const removeBoard = async (num) => {
    await deleteBoard(num);
};

module.exports = {
    writingBoard,
    checkBoard,
    checkIdBoard,
    editBoard,
    removeBoard
};
