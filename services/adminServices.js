const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModal");

// 관리자 등록 함수
const registerAdmin = async (pool, email, adminName, adminAge, password) => {
  const hasExistingAdmin = await userModel.checkExistingAdmin(pool);
  if (hasExistingAdmin) {
    throw new Error("이미 관리자 계정이 존재합니다.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await userModel.insertAdmin(pool, email, adminName, adminAge, hashedPassword);

  // JWT 토큰 생성
  const token = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });
  return token; // 생성된 토큰 반환
};

// 관리자 로그인 함수
const loginAdmin = async (pool, email, password) => {
  const admin = await userModel.findAdminByEmail(pool, email);
  if (!admin) {
    throw new Error("관리자를 찾을 수 없습니다.");
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) {
    throw new Error("비밀번호가 일치하지 않습니다.");
  }

  // JWT 토큰 생성
  const token = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });
  return token; // 생성된 토큰 반환
};







const adminName = (pool) => {
    return (req, res) => {
        const sql = 'SELECT name FROM admin LIMIT 1';

        pool.getConnection((err, conn) => {
            if (err) {
                return res.status(500).json({ message: 'SQL 연결 실패' });
            }

            conn.query(sql, (err, rows) => {
                conn.release();

                if (err) {
                    return res.status(500).json({ message: 'SQL 실행 실패' });
                }

                if (rows.length === 0) {
                    return res.status(404).json({ message: '관리자를 찾을 수 없습니다.' });
                }

                const adminName = rows[0].name;
                res.json({ adminName });
            });
        });
    };
};

const adminAndUserCount = (pool) => (req, res) => {
    const sqlAdmin = 'SELECT admin_date FROM admin LIMIT 1';
    const sqlUserCount = 'SELECT COUNT(*) AS userCount FROM users';
    
    pool.getConnection((err, conn) => {
        if (err) {
            return res.status(500).send('<h1>SQL 연결 실패</h1>');
        }
        
        conn.query(sqlAdmin, (err, adminRows) => {
            if (err) {
                conn.release();
                return res.status(500).send('<h1>SQL 실행 실패</h1>');
            }
            
            conn.query(sqlUserCount, (err, userCountRows) => {
                conn.release();
                
                if (err) {
                    return res.status(500).send('<h1>SQL 실행 실패</h1>');
                }
                
                const adminDate = adminRows.length > 0 ? adminRows[0].admin_date : null;
                const userCount = userCountRows[0].userCount;
                
                res.json({
                    admin_date: adminDate,
                    userCount: userCount
                });
            });
        });
    });
};

// 모듈 내보내기
module.exports = {
    registerAdmin,
    adminName,
    adminAndUserCount,
    loginAdmin
};