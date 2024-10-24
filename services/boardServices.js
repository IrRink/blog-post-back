const { insertBoard, selectBoard, selectIdBoard, updateBoard, deleteBoard } = require("../models/boardModels");

const writingBoard = async (title, sub_title, board_text, userId) => {
    if (!title || !sub_title || !board_text) {
        throw new Error("모든 필드를 입력해야 합니다.");
    }
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

const retouchBoard = async (num, title, sub_title, board_text) => {
    if (!title || !sub_title || !board_text) {
        throw new Error("모든 필드를 입력해야 합니다.");
    }
    await updateBoard(num, title, sub_title, board_text);
};

const removeBoard = async (num) => {
    await deleteBoard(num);
};

module.exports = {
    writingBoard,
    checkBoard,
    checkIdBoard,
    retouchBoard,
    removeBoard
};
