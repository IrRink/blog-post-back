const { insertBoard, selectBoard, selectIdBoard, updateBoard, deleteBoard } = require("../models/boardModels");

const writingBoard = async (title, sub_title, board_text, userId) => {
    await insertBoard(title, sub_title, board_text, userId);
};

const checkBoard = async () => {
    return await selectBoard();
};

const checkIdBoard = async (num) => {
    const post = await selectIdBoard(num);
    if (!post) {
        throw new Error("게시물을 찾을 수 없습니다.");
    }
    return post;
};

const editBoard = async (num, title, sub_title, board_text) => {
    await updateBoard(num, title, sub_title, board_text);
};

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
