const { executeQuery } = require('./executeQuery'); // db 쿼리 실행을 위한 함수

const insertLike = async (email, target_id, target_type) => {
    const query = "INSERT INTO likes (user_email, target_id, target_type) VALUES (?, ?, ?)";
    await executeQuery(query, [email, target_id, target_type]);
};

const deleteLike = async (email, target_id, target_type) => {
    const query = "DELETE FROM likes WHERE user_email = ? AND target_id = ? AND target_type = ?";
    await executeQuery(query, [email, target_id, target_type]);
};

const checkLikeCount = async (target_id, target_type) => {
    const query = "SELECT COUNT(*) AS likeCount FROM likes WHERE target_id = ? AND target_type = ?";
    const [result] = await executeQuery(query, [target_id, target_type]);
    return result.likeCount;
};

const checkIfLiked = async (email, target_id, target_type) => {
    const query = "SELECT * FROM likes WHERE user_email = ? AND target_id = ? AND target_type = ?";
    const result = await executeQuery(query, [email, target_id, target_type]);
    return result.length > 0; // 좋아요 여부 반환
};

module.exports = {
    insertLike,
    deleteLike,
    checkLikeCount,
    checkIfLiked,
};
