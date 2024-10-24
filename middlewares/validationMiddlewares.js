const { check, validationResult } = require("express-validator");

const validateBoard = [
    check("title").notEmpty().withMessage("제목은 필수입니다."),
    check("sub_title").notEmpty().withMessage("부제목은 필수입니다."),
    check("board_text").notEmpty().withMessage("게시물 내용은 필수입니다."),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = { validateBoard };
