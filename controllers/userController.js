const bcrypt = require("bcrypt");

// 사용자 등록 함수
const addUser = (pool) => {
  return async (req, res) => {
    console.log("회원가입 요청 본문:", req.body);

    const { adminId, adminName, adminAge, password, isAdmin } = req.body; // isAdmin을 추가

    try {
      // 사용자 ID 중복 체크
      const idCheckSql =
        "SELECT id FROM users WHERE id = ? UNION SELECT id FROM admin WHERE id = ?";
      const idCheckRows = await new Promise((resolve, reject) => {
        pool.getConnection((err, conn) => {
          if (err) return reject(err);
          conn.query(idCheckSql, [adminId, adminId], (err, result) => {
            conn.release();
            if (err) return reject(err);
            resolve(result);
          });
        });
      });

      if (idCheckRows.length > 0) {
        return res.status(409).json({ message: "이미 사용 중인 아이디입니다." });
      }

      // 비밀번호 해싱
      const hashedPassword = await bcrypt.hash(password, 10);

      if (isAdmin) {
        // 관리자 중복 체크
        const hasExistingAdmin = await checkExistingAdmin(pool);
        if (hasExistingAdmin) {
          return res.status(409).json({ message: "이미 관리자 계정이 존재합니다." });
        }

        // 관리자 등록 SQL 실행
        await insertAdmin(pool, adminId, adminName, adminAge, hashedPassword);
        return res.status(200).json({ message: "관리자 계정이 성공적으로 등록되었습니다." });
      } else {
        // 사용자 등록 SQL 실행
        await insertUser(pool, adminId, adminName, adminAge, hashedPassword);
        return res.status(200).json({ message: "사용자 계정이 성공적으로 등록되었습니다." });
      }
    } catch (error) {
      console.error("사용자 등록 중 오류 발생:", error);
      return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  };
};

// 관리자 존재 여부 확인
const checkExistingAdmin = (pool) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) return reject(err);
      const sql = "SELECT COUNT(*) AS count FROM admin";
      conn.query(sql, (err, result) => {
        conn.release();
        if (err) return reject(err);
        resolve(result[0].count > 0);
      });
    });
  });
};

// 관리자 등록 함수
const insertAdmin = (pool, adminId, adminName, adminAge, hashedPassword) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) return reject(err);
      const sql =
        "INSERT INTO admin (id, name, age, password) VALUES (?, ?, ?, ?)";
      conn.query(sql, [adminId, adminName, adminAge, hashedPassword], (err) => {
        conn.release();
        if (err) return reject(err);
        resolve();
      });
    });
  });
};

// 사용자 등록 함수
const insertUser = (pool, userId, userName, userAge, hashedPassword) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) return reject(err);
      const sql =
        "INSERT INTO users (id, name, age, password) VALUES (?, ?, ?, ?)";
      conn.query(sql, [userId, userName, userAge, hashedPassword], (err) => {
        conn.release();
        if (err) return reject(err);
        resolve();
      });
    });
  });
};

module.exports = {
  addUser,
  // ...다른 내보내기 내용
};
