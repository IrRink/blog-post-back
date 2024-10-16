const pool = require('./pool'); // pool 불러오기

// 쿼리 실행 함수
const executeQuery = async (query, params = []) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                return reject(err);
            }
            connection.query(query, params, (error, results) => {
                connection.release(); // 연결 해제
                if (error) {
                    return reject(error);
                }
                resolve(results);
            });
        });
    });
};

module.exports = { executeQuery };
