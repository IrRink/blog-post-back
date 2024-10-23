const { boardInsert, boardSelect, numBoardSelect, boardUpdate, boardDelete } = require('../models/boardService');


const boardController = {
    boardWriting : async (req, res) => {
        const { title, subtitle, board_text, namee} = req.body;
        
        const userId = namee;

        if (!title || !subtitle || !board_text) {
            return res.status(400).json({ message: '모든 필드를 입력해야 합니다.' });
        }

        try {
            await boardInsert(title, subtitle, board_text, userId);
            res.status(201).json({ message: '게시물이 성공적으로 추가되었습니다!' });
        } catch (error) {
            console.error('게시물 추가 중 오류 발생:', error);
            res.status(500).json({ message: '게시물 추가 중 오류가 발생했습니다.' });
        }
    },
    boardCheck : async (req, res) => {
        try {
            const posts = await boardSelect();
            res.json(posts);
        } catch (error) {
            console.error('게시물 조회 중 오류 발생:', error);
            res.status(500).json({ message: '게시물 조회 중 오류가 발생했습니다.' });
        }
    },
    boardNumCheck : async (req, res) => {
        const num = req.params.num;
    
        try {
            const post = await numBoardSelect(num);
            if (!post) {
                return res.status(404).json({ message: '게시물을 찾을 수 없습니다.' });
            }
            res.json(post);
        } catch (error) {
            console.error('게시물 조회 중 오류 발생:', error);
            res.status(500).json({ message: '게시물 조회 중 오류가 발생했습니다.' });
        }
    },
    boardRetouch : async (req, res) => {
        const num = req.params.num;
        const { title, subtitle, board_text } = req.body;
    
        if (!title || !subtitle || !board_text) {
            return res.status(400).json({ message: '모든 필드를 입력해야 합니다.' });
        }
    
        try {
            await boardUpdate(num, title, subtitle, board_text);
            res.json('게시물이 성공적으로 업데이트되었습니다!');
        } catch (error) {
            console.error('게시물 업데이트 중 오류 발생:', error);
            res.status(500).json({ message: '게시물 업데이트 중 오류가 발생했습니다.' });
        }
    },
    boardRemove : async (req, res) => {
        const num = req.params.num;
    
        try {
            await boardDelete(num);
            res.json({ message: '게시물이 성공적으로 삭제되었습니다!' });
        } catch (error) {
            console.error('게시물 삭제 중 오류 발생:', error);
            res.status(500).json({ message: '게시물 삭제 중 오류가 발생했습니다.' });
        }
    }
};

module.exports = boardController
