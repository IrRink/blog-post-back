function validateSession(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ message: '로그인 필요' });
    }
    next();
}

module.exports = validateSession;
