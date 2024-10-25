const {
    writeComment,
    getComments,
    editComment,
    deleteComment,
  } = require("../services/commentsService");
  
  exports.writeComment = async (req, res) => {
    const { comment_text } = req.body;
    const boardId = req.params.boardId;
  
    try {
      await writeComment(comment_text, req.user, req.email, boardId);
      res.status(201).json({ message: "댓글이 성공적으로 추가되었습니다!" });
    } catch (error) {
      console.error("댓글 작성 중 오류 발생:", error);
      res.status(500).json({ message: "댓글 작성 중 오류가 발생했습니다." });
    }
  };
  
  exports.getComments = async (req, res) => {
    const boardId = req.params.boardId;
  
    try {
      const comments = await getComments(boardId);
      res.json(comments);
    } catch (error) {
      console.error("댓글 조회 중 오류 발생:", error);
      res.status(500).json({ message: "댓글 조회 중 오류가 발생했습니다." });
    }
  };
  
  exports.editComment = async (req, res) => {
    const commentId = req.params.commentId;
    const { comment_text } = req.body;
  
    try {
      await editComment(commentId, comment_text, req.email,req.role);
      res.json({ message: "댓글이 성공적으로 수정되었습니다!" });
    } catch (error) {
      console.error("댓글 수정 중 오류 발생:", error);
      res.status(500).json({ message: "댓글 수정 중 오류가 발생했습니다." });
    }
  };
  
  exports.deleteComment = async (req, res) => {
    const commentId = req.params.commentId;
  
    try {
      await deleteComment(commentId, req.email, req.role);
      res.json({ message: "댓글이 성공적으로 삭제되었습니다!" });
    } catch (error) {
      console.error("댓글 삭제 중 오류 발생:", error);
      res.status(500).json({ message: "댓글 삭제 중 오류가 발생했습니다." });
    }
  };
  