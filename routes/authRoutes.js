const express = require("express");
const {
  login,
  logout,
  checkSession,
} = require("../controllers/authController");
const router = express.Router();

module.exports = (pool) => {
  router.post("/login/:role?", login(pool)); // 로그인 처리
  router.post("/logout", logout); // 로그아웃 처리
  router.get("/session", checkSession);
  return router;
};
