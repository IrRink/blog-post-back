const { executeQuery } = require("./executeQuery");

const insertComment = async (comment_text, user, email, boardId) => {
  const insertQuery = `INSERT INTO comments (comment_text, writer_name, writer_email, board_id) VALUES (?, ?, ?, ?)`;
  await executeQuery(insertQuery, [comment_text, user, email, boardId]);
};

const selectComments = async (boardId) => {
  const selectQuery = `SELECT * FROM comments WHERE board_id = ? ORDER BY time DESC`;
  return await executeQuery(selectQuery, [boardId]);
};

const selectCommentById = async (commentId) => {
  const selectQuery = `SELECT * FROM comments WHERE id = ?`;
  const result = await executeQuery(selectQuery, [commentId]);
  return result[0];
};

const updateComment = async (commentId, comment_text) => {
  const updateQuery = `UPDATE comments SET comment_text = ?, time = CURRENT_TIMESTAMP WHERE id = ?`;
  await executeQuery(updateQuery, [comment_text, commentId]);
};

const removeComment = async (commentId) => {
  const deleteQuery = `DELETE FROM comments WHERE id = ?`;
  await executeQuery(deleteQuery, [commentId]);
};

module.exports = {
  insertComment,
  selectComments,
  selectCommentById,
  updateComment,
  removeComment,
};
