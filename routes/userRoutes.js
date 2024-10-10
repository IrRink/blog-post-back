const express = require('express');
const { addUser } = require('../controllers/userController');
const { addAdmin } = require('../controllers/adminController');
const validateSession = require('../middlewares/sessionValidator');
const checkId = require('../controllers/checkId');
const router = express.Router();

module.exports = (pool) => {
    router.post('/adduseroradmin', addAdmin(pool)); // 관리자 등록
    router.post('/adduseroruser', addUser(pool)); // 사용자 등록
    router.post('/addadmin', validateSession, addAdmin(pool)); // 세션 검증 필요
    router.get('/checkid/:userId', checkId(pool)); // 아이디 중복 체크
    return router;
};
