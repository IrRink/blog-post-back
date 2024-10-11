const express = require("express");
const {
  adminName,
  adminAndUserCount,
} = require("../services/adminServices"); // 경로가 정확한지 확인
const adminController = require("../controllers/adminController");
const router = express.Router();

module.exports = (pool) => {
  // 관리자 이름을 가져오는 API
  router.get("/adminname", (req, res) => adminName(pool)(req, res));
  
  // 관리자 정보와 회원 수를 가져오는 API
  router.get("/adminAndUserCount", (req, res) => adminAndUserCount(pool)(req, res));
  
  // 관리자 등록 라우트
  router.post("/register", adminController.registerAdminController);

  // 관리자 로그인 라우트
  router.post("/login", adminController.loginAdminController);

  return router; // 모든 라우트를 포함한 라우터 반환
};
