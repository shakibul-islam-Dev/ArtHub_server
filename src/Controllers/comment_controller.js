const Comment = require("../models/Comment");

class CommentController {
  async getAll() {
    const comments = await Comment.find();
    return comments;
  }

  async getById(id) {
    const comment = await Comment.findById(id);
    if (!comment) {
      return { message: "Comment not found" };
    }
    return comment;
  }

  async create(comment) {
    const newComment = new Comment(comment);
    const savedComment = await newComment.save();
    return savedComment;
  }

  async update(id, comment) {
    const existingComment = await Comment.findById(id);
    if (!existingComment) {
      return { message: "Comment not found" };
    }

    const updateData = {
      comment: comment.comment,
      user_id: comment.user_id,
      artwork_id: comment.artwork_id,
      date_uploaded: comment.date_uploaded,
    };

    const updatedComment = await Comment.findByIdAndUpdate(id, updateData, {
      new: true, // এর ফলে আপডেট হওয়া নতুন ডাটা রিটার্ন করবে
    });

    return updatedComment;
  }

  async delete(id) {
    const comment = await Comment.findByIdAndDelete(id);
    if (!comment) {
      return { message: "Comment not found" };
    }
    return { message: "Comment deleted successfully" };
  }
}

module.exports = new CommentController();
