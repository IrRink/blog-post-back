const { insertBoard, selectBoard, selectIdBoard, updateBoard, deleteBoard } = require("../models/boardModels");

// 게시물 저장
const writingBoard = async (title, sub_title, board_text, id, role) => {
    if (role == "user")throw new Error("관리자가 아닙니다");
    await insertBoard(title, sub_title, board_text, id);
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
const editBoard = async (num, title, sub_title, board_text, role) => {
    if (role == "user")throw new Error("관리자가 아닙니다");
    await updateBoard(num, title, sub_title, board_text);
};

// 게시물 삭제
const removeBoard = async (num, role) => {
    if (role == "user")throw new Error("관리자가 아닙니다");
    await deleteBoard(num);
};

module.exports = {
    writingBoard,
    checkBoard,
    checkIdBoard,
    editBoard,
    removeBoard
};
