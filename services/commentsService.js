const {
    insertComment,
    selectComments,
    updateComment,
    deleteComment,
    selectCommentId,
  } = require("../models/commentsModels");
  
   // 댓글 작성
  const writeComment = async (comment_text, boardId, id) => {
    if (!comment_text) throw new Error("댓글 내용을 입력해야 합니다.");
    await insertComment(comment_text, boardId, id);
  };
  
  // 게시물 댓글 조회
  const getComments = async (boardId) => {
    return await selectComments(boardId);
  };
  
  // 댓글 수정
  const editComment = async (commentId, comment_text, id, role) => {
    const existingComment = await selectCommentId(commentId);
    if (id !== existingComment.user_id && role !== "admin") {
      throw new Error("본인의 댓글만 수정할 수 있습니다.");
    }
    await updateComment(commentId, comment_text);
  };
  
  // 댓글 삭제
  const removeComment = async (commentId, id, role) => {
    const existingComment = await selectCommentId(commentId);
    if (id !== existingComment.user_id && role !== "admin") {
      throw new Error("본인의 댓글만 삭제할 수 있습니다.");
    }
    await deleteComment(commentId);
  };
  
  module.exports = {
    writeComment,
    getComments,
    editComment,
    removeComment,
  };
  