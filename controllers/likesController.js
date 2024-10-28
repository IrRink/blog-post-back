const {changeLikes, getcountLikes} = require('../services/likesServices');

const switchLike = async (req, res) => {
    const { target_id, target_type } = req.body; // request body에서 값 가져오기

    try {
        const result = await changeLikes(req.email, target_id, target_type);
        res.json(result);
    } catch (error) {
        console.error("좋아요 처리 중 오류 발생:", error);
        res.status(500).json({ message: "좋아요 처리 중 오류가 발생했습니다." });
    }
};

const checkLikeCount = async (req, res) => {
    const { target_type, target_id } = req.params; // request params에서 값 가져오기
    try {
        const result = await getcountLikes(target_id, target_type);
        res.json(result);
    } catch (error) {
        console.error("좋아요 수 조회 중 오류 발생:", error);
        res.status(500).json({ message: "좋아요 수 조회 중 오류가 발생했습니다." });
    }
};

module.exports = {
    switchLike,
    checkLikeCount,
};
