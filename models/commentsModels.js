const { executeQuery } = require("./executeQuery");

// 댓글 작성
const insertComment = async (comment_text, user, email, boardId) => {
  const insertQuery = `INSERT INTO comments (comment_text, writer_name, writer_email, board_id) VALUES (?, ?, ?, ?)`;
  await executeQuery(insertQuery, [comment_text, user, email, boardId]);
};

// 게시물 댓글 조회
const selectComments = async (boardId) => {
  const selectQuery = `SELECT * FROM comments WHERE board_id = ? ORDER BY time DESC`;
  return await executeQuery(selectQuery, [boardId]);
};

// 지정한 id의 내용 전부 불러오기
const selectCommentId = async (commentId) => {
  const selectQuery = `SELECT * FROM comments WHERE id = ?`;
  const result = await executeQuery(selectQuery, [commentId]);
  return result[0];
};

// 댓글 수정
const updateComment = async (commentId, comment_text) => {
  const updateQuery = `UPDATE comments SET comment_text = ?, time = CURRENT_TIMESTAMP WHERE id = ?`;
  await executeQuery(updateQuery, [comment_text, commentId]);
};

// 댓글 삭제
const deleteComment = async (commentId) => {
  const deleteQuery = `DELETE FROM comments WHERE id = ?`;
  await executeQuery(deleteQuery, [commentId]);
};

module.exports = {
  insertComment,
  selectComments,
  selectCommentId,
  updateComment,
  deleteComment,
};