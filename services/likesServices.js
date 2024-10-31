const { insertBoardLike,
    insertCommentLike,
    deleteBoardLike,
    deleteCommentLike,
    checkBoardLikeCount,
    checkCommentLikeCount,
    checkBoardIfLiked,
    checkICommentfLiked, 
    checkLikeCollection } = require('../models/likesModels');

// board 좋아요 기능
const changeBoardLikes = async (id, board_id) => {
    const isLiked = await checkBoardIfLiked(id, board_id);
    if (isLiked) {
        await deleteBoardLike(id, board_id);
        return { message: '좋아요가 제거되었습니다.' };
    } else {
        await insertBoardLike(id, board_id);
        return { message: '좋아요가 추가되었습니다.' };
    }
};

// comment 좋아요 기능
const changeCommentLikes = async (id, comment_id) => {
    const isLiked = await checkICommentfLiked(id, comment_id);
    if (isLiked) {
        await deleteCommentLike(id, comment_id);
        return { message: '좋아요가 제거되었습니다.' };
    } else {
        await insertCommentLike(id, comment_id);
        return { message: '좋아요가 추가되었습니다.' };
    }
};

// board 좋아요의 갯수를 불러옴
const getBoardCountLikes = async (boardId) => {
    const count = await checkBoardLikeCount(boardId);
    return { count };
};

// comment 좋아요의 갯수를 불러옴
const getCommentCountLikes = async (commentId) => {
    const count = await checkCommentLikeCount(commentId);
    return { count };
};

// 내가 고른 좋아요 모음
const  likeCollection = async (id) => {
    return await checkLikeCollection(id);
};


module.exports = {
    changeBoardLikes,
    changeCommentLikes,
    getBoardCountLikes,
    getCommentCountLikes,
    likeCollection,
};
