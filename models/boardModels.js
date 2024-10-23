const { executeQuery } = require('./executeQuery');

// 게시물 저장
const boardInsert = async (title, subTitle, boardText, userId) => {
    const insertQuery = 'INSERT INTO boardtable (title, subTitle, boardText, writer) VALUES (?, ?, ?, ?)';
    await executeQuery(insertQuery, [title, subTitle, boardText, userId]);
};

// 게시물 조회
const boardSelect = async () => {
    const queries = [
        'SET @count = 0;',
        'UPDATE boardtable SET num = @count := @count + 1;',
        'SELECT * FROM boardtable ORDER BY num DESC'
    ];
    for (const query of queries) {
        await executeQuery(query);
    }
    return await executeQuery(queries[2]);
};

// 개별 게시물 조회
const numBoardSelect = async (num) => {
    const numSelectQuery = 'SELECT * FROM boardtable WHERE num = ?';
    const results = await executeQuery(numSelectQuery, [num]);
    return results[0];
};

// 게시물 업데이트
const boardUpdate = async (num, title, subTitle, boardText) => {
    const updateQuery = 'UPDATE boardtable SET title = ?, subTitle = ?, boardText = ? WHERE num = ?';
    await executeQuery(updateQuery, [title, subTitle, boardText, num]);
};

// 게시물 삭제
const boardDelete = async (num) => {
    const deleteQuery = 'DELETE FROM boardtable WHERE num = ?';
    await executeQuery(deleteQuery, [num]);
};

module.exports = { boardInsert, boardSelect, numBoardSelect, boardUpdate, boardDelete };