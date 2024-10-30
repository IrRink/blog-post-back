const { executeQuery } = require("./executeQuery");

// 게시물 저장
const insertBoard = async (title, sub_title, board_text, id) => {
  const insertQuery =
    "INSERT INTO boardtable (title, sub_title, board_text, user_id) VALUES (?, ?, ?, ?)";
  await executeQuery(insertQuery, [title, sub_title, board_text, id]);
};

// 게시물 전체 조회
const selectBoard = async () => {
  const selectquerie = `SELECT boardtable.id, boardtable.title, boardtable.sub_title, boardtable.uptime, users.name
  FROM boardtable 
  JOIN users ON users.id = boardtable.user_id
  ORDER BY uptime DESC`;
  return await executeQuery(selectquerie);
};

// 개별 게시물 조회
const selectIdBoard = async (num) => {
  const numSelectQuery = `SELECT boardtable.id, boardtable.title, boardtable.sub_title, boardtable.board_text, boardtable.uptime, users.name 
  FROM boardtable 
  JOIN users ON users.id = boardtable.user_id
  WHERE boardtable.id = ?`;
  const results = await executeQuery(numSelectQuery, [num]);
  return results[0];
};

// 게시물 수정
const updateBoard = async (num, title, sub_title, board_text) => {
  const updateQuery =
    "UPDATE boardtable SET title = ?, sub_title = ?, board_text = ?, uptime = now() WHERE id = ?";
  await executeQuery(updateQuery, [title, sub_title, board_text, num]);
};

// 게시물 삭제
const deleteBoard = async (num) => {
  const deleteQuery = "DELETE FROM boardtable WHERE id = ?";
  await executeQuery(deleteQuery, [num]);
};

module.exports = {
  insertBoard,
  selectBoard,
  selectIdBoard,
  updateBoard,
  deleteBoard,
};
