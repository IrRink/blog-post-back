// controllers/authController.js
const bcrypt = require("bcrypt");
exports.login = (pool) => (req, res) => {
  const { role } = req.params; // 사용자 역할 (user 또는 admin)
  const { userId, password } = req.body;

  pool.getConnection((err, conn) => {
    if (err) {
      return res.status(500).json({ message: "SQL 연결 실패" });
    }

    let sql;
    if (role === "admin") {
      sql = "SELECT * FROM admin WHERE id = ?";
    } else {
      sql = "SELECT * FROM users WHERE id = ?";
    }

    conn.query(sql, [userId], async (err, rows) => {
      conn.release();

      if (err) {
        return res.status(500).json({ message: "SQL 실행 실패" });
      }

      if (rows.length === 0) {
        return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
      }

      const user = rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res
          .status(401)
          .json({ message: "비밀번호가 일치하지 않습니다." });
      }
      if(passwordMatch){
          // 로그인 성공
          req.session.userId = user.id; // 세션에 사용자 ID 저장
          req.session.userName = user.name; // 세션에 사용자 이름 저장
          req.session.userAge = user.age; // 세션에 사용자 나이 저장

      }

      res
        .status(200)
        .json(user.name);
    });
  });
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "로그아웃 실패" });
    }
    res.status(200).json({ message: "로그아웃 성공" });
  });
};

exports.checkSession = (req, res) => {
  if (req.session && req.session.userId) {
    res.status(200).json({
      message: "세션이 유효합니다.",
      userId: req.session.userId,
      userName: req.session.userName,
    });
  } else {
    res.status(404).json({ message: "세션이 유효하지 않습니다." });
  }
};





