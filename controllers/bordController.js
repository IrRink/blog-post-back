const mysql = require('mysql2');
const dbconfig = require('../dbconfig/dbconfig.json');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: dbconfig.host,
    user: dbconfig.user,
    password: dbconfig.password,
    database: dbconfig.database,
    debug: false,
    dateStrings: true
});

// MySQL 연결 풀 설정
// var pool = mysql.createPool({
//     connectionLimit: 10,
//     host: 'localhost',
//     user: 'root',
//     password: '0930',
//     database: 'bord',
//     dateStrings: true
// });


// 임시로 로그인된 사용자 ID를 사용
const loggedInUserId = 'a';

// 관리자 여부 확인 함수
const checkAdminStatus = (userId, callback) => {
    pool.getConnection((err, connection) => {
        if (err) {
            callback(err);
            return;
        }
        const adminQuery = 'SELECT COUNT(*) AS isAdmin FROM admin WHERE id = ?';
        connection.execute(adminQuery, [userId], (err, results) => {
            connection.release(); // 커넥션 해제
            if (err) {
                callback(err);
                return;
            }
            const isAdmin = results[0].isAdmin > 0;
            callback(null, isAdmin);
        });
    });
};

// 게시물 저장
class Bordinsert {
    inspost(req, res) {
        const { title, bord_text: bordText, subtitle } = req.body;

        if (!title || !bordText || !subtitle) {
            return res.status(400).json({ message: "All fields are required" });
        }

        pool.getConnection((err, connection) => {
            if (err) {
                console.error("Error connecting to the database: " + err);
                return res.status(500).json({ message: "Database connection error" });
            }

            const insertQuery = 'INSERT INTO bordtable (title, subtitle, bord_text, id) VALUES (?, ?, ?, ?)';
            connection.execute(insertQuery, [title, subtitle, bordText, loggedInUserId], (err, result) => {
                connection.release();  // 커넥션 해제
                if (err) {
                    console.error("Error inserting post: " + err);
                    return res.status(500).json({ message: "Error inserting post" });
                }
                res.json({ message: "Post added successfully!" });
            });
        });
    }
}
const bordinsert = new Bordinsert();

// 게시물 조회
class Bordselect {
    selpost(req, res) {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error("Error connecting to the database: " + err);
                return res.status(500).json({ message: "Database connection error" });
            }

            const numResetQuery = 'SET @count = 0;';
            const numUpdateQuery = 'UPDATE bordtable SET num = @count := @count + 1;';

            connection.execute(numResetQuery, (err) => {
                if (err) {
                    connection.release();
                    console.error("Error resetting num values: " + err);
                    return res.status(500).json({ message: "Error resetting post numbers" });
                }

                connection.execute(numUpdateQuery, (err) => {
                    if (err) {
                        connection.release();
                        console.error("Error updating num values: " + err);
                        return res.status(500).json({ message: "Error updating post numbers" });
                    }

                    const selectQuery = 'SELECT * FROM bordtable';
                    connection.execute(selectQuery, (err, results) => {
                        connection.release();
                        if (err) {
                            console.error("Error fetching posts: " + err);
                            return res.status(500).json({ message: "Error fetching posts" });
                        }
                        res.json(results);
                    });
                });
            });
        });
    }
}
const bordselect = new Bordselect();

// 개별 게시물 조회
class Bordnumselect {
    selpost2(req, res) {
        const postId = req.params.postId;

        pool.getConnection((err, connection) => {
            if (err) {
                console.error("Error connecting to the database: " + err);
                return res.status(500).json({ message: "Database connection error" });
            }

            const selectQuery = 'SELECT * FROM bordtable WHERE num = ?';
            connection.execute(selectQuery, [postId], (err, results) => {
                connection.release();
                if (err) {
                    console.error("Error fetching post: " + err);
                    return res.status(500).json({ message: "Error fetching post" });
                }

                if (results.length === 0) {
                    return res.status(404).json({ message: "Post not found" });
                }

                const post = results[0];
                const canEditOrDelete = post.id === loggedInUserId;

                checkAdminStatus(loggedInUserId, (err, isAdmin) => {
                    if (err) {
                        console.error("Error checking admin status: " + err);
                        return res.status(500).json({ message: "Error checking admin status" });
                    }

                    const showEditDeleteButtons = canEditOrDelete || isAdmin;
                    res.json({ post, canEditOrDelete: showEditDeleteButtons });
                });
            });
        });
    }
}
const bordnumselect = new Bordnumselect();

// 게시물 수정 폼
class Bordedit {
    uppost(req, res) {
        const postId = req.params.postId;

        pool.getConnection((err, connection) => {
            if (err) {
                console.error("Error connecting to the database: " + err);
                return res.status(500).json({ message: "Database connection error" });
            }

            const selectQuery = 'SELECT * FROM bordtable WHERE num = ?';
            connection.execute(selectQuery, [postId], (err, results) => {
                connection.release();
                if (err) {
                    console.error("Error fetching post: " + err);
                    return res.status(500).json({ message: "Error fetching post" });
                }

                if (results.length === 0) {
                    return res.status(404).json({ message: "Post not found" });
                }

                const post = results[0];
                res.json(post);
            });
        });
    }
}
const bordedit = new Bordedit();

// 게시물 업데이트
class Bordupdate {
    uppost2(req, res) {
        const postId = req.params.postId;
        const { title, subtitle, bord_text: updatedContent } = req.body;

        pool.getConnection((err, connection) => {
            if (err) {
                console.error("Error connecting to the database: " + err);
                return res.status(500).json({ message: "Database connection error" });
            }

            const updateQuery = 'UPDATE bordtable SET title = ?, subtitle = ?, bord_text = ? WHERE num = ?';
            connection.execute(updateQuery, [title, subtitle, updatedContent, postId], (err) => {
                connection.release();
                if (err) {
                    console.error("Error updating post: " + err);
                    return res.status(500).json({ message: "Error updating post" });
                }

                res.json({ message: "Post updated successfully!" });
            });
        });
    }
}
const bordupdate = new Bordupdate(); // 여기서 'new' 키워드를 추가

// 게시물 삭제
class Borddelete {
    delpost(req, res) {
        const postId = req.params.postId;

        pool.getConnection((err, connection) => {
            if (err) {
                console.error("Error connecting to the database: " + err);
                return res.status(500).json({ message: "Database connection error" });
            }

            const selectQuery = 'SELECT * FROM bordtable WHERE num = ?';
            connection.execute(selectQuery, [postId], (err, results) => {
                if (err) {
                    connection.release();
                    console.error("Error fetching post: " + err);
                    return res.status(500).json({ message: "Error fetching post" });
                }

                if (results.length === 0) {
                    connection.release();
                    return res.status(404).json({ message: "Post not found" });
                }

                const deleteQuery = 'DELETE FROM bordtable WHERE num = ?';
                connection.execute(deleteQuery, [postId], (err) => {
                    connection.release();
                    if (err) {
                        console.error("Error deleting post: " + err);
                        return res.status(500).json({ message: "Error deleting post" });
                    }

                    res.json({ message: "Post deleted successfully!" });
                });
            });
        });
    }
}
const borddelete = new Borddelete();

module.exports = { bordinsert, bordselect, bordnumselect, bordedit, bordupdate, borddelete };
