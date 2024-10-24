const { executeQuery } = require("./executeQuery");

// 게시물 저장
const insertBoard = async (title, sub_title, board_text, userId) => {
  const insertQuery =
    "INSERT INTO boardtable (title, sub_title, board_text, writer) VALUES (?, ?, ?, ?)";
  await executeQuery(insertQuery, [title, sub_title, board_text, userId]);
};

// 게시물 조회
const boardSelect = async () => {
  const queries = [
    "SET @count = 0;",
    "UPDATE boardtable SET id = @count := @count + 1;",
    "SELECT * FROM boardtable ORDER BY id DESC",
  ];
  for (const query of queries) {
    await executeQuery(query);
  }
  return await executeQuery(queries[2]);
};

// 개별 게시물 조회
const selectIdBoard = async (num) => {
  const numSelectQuery = "SELECT * FROM boardtable WHERE id = ?";
  const results = await executeQuery(numSelectQuery, [num]);
  return results[0];
};

// 게시물 업데이트
const updateBoard = async (num, title, sub_title, board_text) => {
  const updateQuery =
    "UPDATE boardtable SET title = ?, sub_title = ?, board_text = ? WHERE id = ?";
  await executeQuery(updateQuery, [title, sub_title, board_text, num]);
};

// 게시물 삭제
const deleteBoard = async (num) => {
  const deleteQuery = "DELETE FROM boardtable WHERE id = ?";
  await executeQuery(deleteQuery, [num]);
};

module.exports = {
  insertBoard,
  boardSelect,
  selectIdBoard,
  updateBoard,
  deleteBoard,
};
