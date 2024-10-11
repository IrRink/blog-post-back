const express = require("express");
const { addUser } = require("../controllers/userController");
const checkId = require("../controllers/checkId");
const router = express.Router();

module.exports = (pool) => {
  router.post("/adduseroradmin", addUser(pool)); // 사용자 등록
  router.post("/adduseroruser", addUser(pool));
  router.get("/checkid/:userId", checkId(pool)); // 아이디 중복 체크
  return router;
};
