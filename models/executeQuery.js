const pool = require("./pool"); // pool 불러오기

// 쿼리 실행 함수
const executeQuery = async (query, params = []) => {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    throw error;
  }
};

module.exports = { executeQuery };
