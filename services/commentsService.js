const {
    insertComment,
    selectComments,
    updateComment,
    deleteComment,
    selectCommentId,
  } = require("../models/commentsModels");
  
  const writeComment = async (comment_text, user, email, boardId) => {
    if (!comment_text) throw new Error("댓글 내용을 입력해야 합니다.");
    await insertComment(comment_text, user, email, boardId);
  };
  
  const getComments = async (boardId) => {
    return await selectComments(boardId);
  };
  
  const editComment = async (commentId, comment_text, email, role) => {
    const existingComment = await selectCommentId(commentId);
    if (email !== existingComment.writer_email && role !== "admin") {
      throw new Error("본인의 댓글만 수정할 수 있습니다.");
    }
    await updateComment(commentId, comment_text);
  };
  
  const removeComment = async (commentId, email, role) => {
    const existingComment = await selectCommentId(commentId);
    if (email !== existingComment.writer_email && role !== "admin") {
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
  