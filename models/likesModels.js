const { executeQuery } = require('./executeQuery'); // db 쿼리 실행을 위한 함수

// board 좋아요 추가
const insertBoardLike = async (id, board_id) => {
    const query = "INSERT INTO likes (user_id, board_id) VALUES (?, ?)";
    await executeQuery(query, [id, board_id]);
};

// comment 좋아요 추가
const insertCommentLike = async (id, comment_id) => {
    const query = "INSERT INTO likes (user_id, comment_id) VALUES (?, ?)";
    await executeQuery(query, [id, comment_id]);
};

// board 좋아요 취소
const deleteBoardLike = async (id, board_id) => {
    const query = "DELETE FROM likes WHERE user_id = ? AND board_id = ?";
    await executeQuery(query, [id, board_id]);
};

// comment 좋아요 취소
const deleteCommentLike = async (id, board_id) => {
    const query = "DELETE FROM likes WHERE user_id = ? AND comment_id = ?";
    await executeQuery(query, [id, board_id]);
};

// board 해당 좋아요의 갯수세기 
const checkBoardLikeCount = async (boardId) => {
    const query = "SELECT COUNT(*) AS likeCount FROM likes WHERE board_id = ?";
    const [result] = await executeQuery(query, [boardId]);
    return result.likeCount;
};

// comment 해당 좋아요의 갯수세기 
const checkCommentLikeCount = async (commentId) => {
    const query = "SELECT COUNT(*) AS likeCount FROM likes WHERE comment_id = ?";
    const [result] = await executeQuery(query, [commentId]);
    return result.likeCount;
};

// board 해당 좋아요가 있는지
const checkBoardIfLiked = async (id, board_id) => {
    const query = "SELECT * FROM likes WHERE user_id = ? AND board_id = ?";
    const result = await executeQuery(query, [id, board_id]);
    return result.length > 0; // 좋아요 여부 반환
};

// comment 해당 좋아요가 있는지
const checkICommentfLiked = async (id, comment_id) => {
    const query = "SELECT * FROM likes WHERE user_id = ? AND comment_id = ?";
    const result = await executeQuery(query, [id, comment_id]);
    return result.length > 0; // 좋아요 여부 반환
};

// 좋아요를 누른것들 모음
const checkLikeCollection = async (id) => {
    const query = `SELECT 
    likes.id,

    boardtable.title AS board_title,
    boardtable.sub_title AS board_sub_title,
    boardtable.uptime AS board_uptime,
    board_user.name AS board_user_name,

    comments.comment_text AS comment_text,
    comments.uptime AS comment_uptime,
    comment_user.name AS comment_user_name

    FROM likes
    LEFT JOIN boardtable ON boardtable.id = likes.board_id
    LEFT JOIN users AS board_user ON boardtable.user_id = board_user.id
    LEFT JOIN comments ON comments.id = likes.comment_id
    LEFT JOIN users AS comment_user ON comments.user_id = comment_user.id
    WHERE likes.user_id = ?
    ORDER BY 
    CASE 
        WHEN boardtable.uptime IS NOT NULL THEN boardtable.uptime
        ELSE comments.uptime
    END DESC;
`;
    const result = await executeQuery(query, [id]);
    return result;
};


module.exports = {
    insertBoardLike,
    insertCommentLike,
    deleteBoardLike,
    deleteCommentLike,
    checkBoardLikeCount,
    checkCommentLikeCount,
    checkBoardIfLiked,
    checkICommentfLiked,
    checkLikeCollection,
};
