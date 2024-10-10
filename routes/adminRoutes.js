const express = require('express');
const { adminName, adminAndUserCount } = require('../controllers/adminController'); // 경로가 정확한지 확인
const router = express.Router();

module.exports = (pool) => {
    router.get('/adminname', adminName(pool)); // 관리자 이름을 가져오는 API
    router.get('/adminAndUserCount', adminAndUserCount(pool)); // 관리자 정보와 회원 수를 가져오는 API
    return router;
};