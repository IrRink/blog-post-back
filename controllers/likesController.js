const { changeBoardLikes,
    changeCommentLikes,
    getBoardCountLikes,
    getCommentCountLikes,
    likeCollection, } = require('../services/likesServices');

// 좋아요 추가 및 삭제
const switchBoardLike = async (req, res) => {
    const board_id = req.params.boardid;

    try {
        const result = await changeBoardLikes(req.id, board_id);
        res.json(result);
    } catch (error) {
        console.error("좋아요 처리 중 오류 발생:", error);
        res.status(500).json({ message: "좋아요 처리 중 오류가 발생했습니다." });
    }
};

// comment 좋아요 추가 및 삭제
const switchCommentLike = async (req, res) => {
    const comment_id = req.params.commentid;

    try {
        const result = await changeCommentLikes(req.id, comment_id);
        res.json(result);
    } catch (error) {
        console.error("좋아요 처리 중 오류 발생:", error);
        res.status(500).json({ message: "좋아요 처리 중 오류가 발생했습니다." });
    }
};

// 특정 게시물/댓글의 좋아요 수 조회
const checkBoardLikeCount = async (req, res) => {
    const boardId = req.params.boardid; // request params에서 값 가져오기
    try {
        const result = await getBoardCountLikes(boardId);
        res.json(result);
    } catch (error) {
        console.error("좋아요 수 조회 중 오류 발생:", error);
        res.status(500).json({ message: "좋아요 수 조회 중 오류가 발생했습니다." });
    }
};

// 특정 게시물/댓글의 좋아요 수 조회
const checkCommentLikeCount = async (req, res) => {
    const commentId = req.params.commentid; // request params에서 값 가져오기
    try {
        const result = await getCommentCountLikes(commentId);
        res.json(result);
    } catch (error) {
        console.error("좋아요 수 조회 중 오류 발생:", error);
        res.status(500).json({ message: "좋아요 수 조회 중 오류가 발생했습니다." });
    }
};

// 내가 고른 좋아요 모음
const checkLikeCollection = async (req, res) => {
    try {
        const likedFavorites = await likeCollection(req.id);
        res.json( likedFavorites );
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: '좋아요한 항목 조회 중 오류가 발생했습니다.' });
    }
};


module.exports = {
    switchBoardLike,
    switchCommentLike,
    checkBoardLikeCount,
    checkCommentLikeCount,
    checkLikeCollection,
};
