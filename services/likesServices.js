const {checkIfLiked, deleteLike, insertLike, checkLikeCount} = require('../models/likesModels');

const  changeLikes= async (email, target_id, target_type) => {
    const isLiked = await checkIfLiked(email, target_id, target_type);
    if (isLiked) {
        await deleteLike(email, target_id, target_type);
        return { message: '좋아요가 제거되었습니다.' };
    } else {
        await insertLike(email, target_id, target_type);
        return { message: '좋아요가 추가되었습니다.' };
    }
};

const getcountLikes = async (target_id, target_type) => {
    const count = await checkLikeCount(target_id, target_type);
    return { count };
};

module.exports = {
    changeLikes,
    getcountLikes,
};
