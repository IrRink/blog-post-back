const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();

// MySQL 연결 풀 설정
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '0930',
    database: 'bord'
});

// bodyParser 설정
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
            connection.release();
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
app.post('/add-post', (req, res) => {
    const title = req.body.title;     
    const bordText = req.body.bord_text;  

    pool.getConnection(function (err, connection) {
        if (err) {
            console.error("Error connecting to the database: " + err);
            return res.status(500).json({ message: "Database connection error" });
        }

        const insertQuery = 'INSERT INTO bordtable (title, bord_text, id) VALUES (?, ?, ?)';
        connection.execute(insertQuery, [title, bordText, loggedInUserId], function (err, result) {
            connection.release();
            if (err) {
                console.error("Error inserting post: " + err);
                return res.status(500).json({ message: "Error inserting post" });
            }
            res.json({ message: "Add successfully!" });
        });
    });
});

// 게시물 조회
app.get('/blogbord', (req, res) => {
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
});

// 개별 게시물 조회
app.get('/post/:postId', (req, res) => {
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
});

// 게시물 수정 폼
app.get('/edit-post/:postId', (req, res) => {
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
});

// 게시물 업데이트
app.post('/update-post/:postId', (req, res) => {
    const postId = req.params.postId;
    const updatedTitle = req.body.title;
    const updatedContent = req.body.bord_text;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error connecting to the database: " + err);
            return res.status(500).json({ message: "Database connection error" });
        }

        const updateQuery = 'UPDATE bordtable SET title = ?, bord_text = ? WHERE num = ?';
        connection.execute(updateQuery, [updatedTitle, updatedContent, postId], (err, result) => {
            connection.release();

            if (err) {
                console.error("Error updating post: " + err);
                return res.status(500).json({ message: "Error updating post" });
            }

            res.json({ message: "Updated successfully!" });
        });
    });
});

// 게시물 삭제
app.post('/delete-post/:postId', (req, res) => {
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

            const post = results[0];

            const deleteQuery = 'DELETE FROM bordtable WHERE num = ?';
            connection.execute(deleteQuery, [postId], (err, result) => {
                connection.release();

                if (err) {
                    console.error("Error deleting post: " + err);
                    return res.status(500).json({ message: "Error deleting post" });
                }

                res.json({ message: "Deleted successfully!" });
            });
        });
    });
});

// 서버 실행
const PORT = process.env.PORT || 4000;  // 환경변수를 사용하여 포트 설정
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
