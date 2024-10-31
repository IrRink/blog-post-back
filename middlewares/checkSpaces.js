const { check, validationResult } = require("express-validator");

const checkSpaces = [
    check("title").notEmpty().withMessage("제목은 필수로 작성해 주세요."),
    check("sub_title").notEmpty().withMessage("부제목은 필수로 작성해 주세요."),
    check("board_text").notEmpty().withMessage("게시물 내용은 필수로 작성해 주세요."),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const messages = errors.array().map(error => error.msg);
            return res.status(400).json(messages);
        }
        next();
    }
];

module.exports = { checkSpaces };
