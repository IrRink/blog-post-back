const mysql = require("mysql2");

// 커넥션 생성
const createConnection = (pool) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err);
      resolve(connection);
    });
  });
};

// 이메일 중복 체크
const checkUserEmailExists = (pool, email) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT email FROM users WHERE email = ? UNION SELECT email FROM admin WHERE email = ?";
    createConnection(pool)
      .then((connection) => {
        connection.query(sql, [email, email], (err, result) => {
          connection.release();
          if (err) return reject(err);
          resolve(result);
        });
      })
      .catch(reject);
  });
};

// 관리자 존재 여부 확인
const checkExistingAdmin = (pool) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT COUNT(*) AS count FROM admin";
    createConnection(pool)
      .then((connection) => {
        connection.query(sql, (err, result) => {
          connection.release();
          if (err) return reject(err);
          resolve(result[0].count > 0);
        });
      })
      .catch(reject);
  });
};

// 관리자 등록
const insertAdmin = (pool, email, adminName, adminAge, hashedPassword) => {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO admin (email, name, age, password) VALUES (?, ?, ?, ?)";
    createConnection(pool)
      .then((connection) => {
        connection.query(sql, [email, adminName, adminAge, hashedPassword], (err) => {
          connection.release();
          if (err) return reject(err);
          resolve();
        });
      })
      .catch(reject);
  });
};

// 사용자 등록
const insertUser = (pool, email, userName, userAge, hashedPassword) => {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO users (email, name, age, password) VALUES (?, ?, ?, ?)";
    createConnection(pool)
      .then((connection) => {
        connection.query(sql, [email, userName, userAge, hashedPassword], (err) => {
          connection.release();
          if (err) return reject(err);
          resolve();
        });
      })
      .catch(reject);
  });
};

// 사용자 이메일로 찾기
const findUserByEmail = (pool, email) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM users WHERE email = ?";
    createConnection(pool)
      .then((connection) => {
        connection.query(sql, [email], (err, result) => {
          connection.release();
          if (err) return reject(err);
          resolve(result[0]); // 사용자 정보를 반환
        });
      })
      .catch(reject);
  });
};

// 관리자 이메일로 찾기
const findAdminByEmail = (pool, email) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM admin WHERE email = ?";
    createConnection(pool)
      .then((connection) => {
        connection.query(sql, [email], (err, result) => {
          connection.release();
          if (err) return reject(err);
          resolve(result[0]); // 관리자 정보를 반환
        });
      })
      .catch(reject);
  });
};

module.exports = {
  checkUserEmailExists,
  checkExistingAdmin,
  insertAdmin,
  insertUser,
  findUserByEmail, // 추가된 메서드
  findAdminByEmail, // 추가된 메서드
};
