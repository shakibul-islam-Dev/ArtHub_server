const { ObjectId } = require("mongodb");
const Comment = require("../models/Comment");
const { getCollection } = require("../config/database"); // 🎯 আপনার তৈরি করা ফাংশনটি ইম্পোর্ট করা হলো

class CommentController {
  async getAll() {
    // getCollection async হওয়ায় অবশই await দিতে হবে
    const collection = await getCollection("comments");
    const comments = await collection.find({}).toArray();
    return comments;
  }

  async getById(id) {
    if (!ObjectId.isValid(id)) throw new Error("Invalid Object ID format.");

    const collection = await getCollection("comments");
    const comment = await collection.findOne({ _id: new ObjectId(id) });

    if (!comment) {
      return { message: "Comment not found" };
    }
    return comment;
  }

  async create(commentData) {
    const collection = await getCollection("comments");

    // Model validation running
    const formattedComment = Comment.format(commentData);

    const result = await collection.insertOne(formattedComment);

    return {
      _id: result.insertedId,
      ...formattedComment,
    };
  }

  async update(id, commentData) {
    if (!ObjectId.isValid(id)) throw new Error("Invalid Object ID format.");

    const collection = await getCollection("comments");
    const query = { _id: new ObjectId(id) };

    const existingComment = await collection.findOne(query);
    if (!existingComment) {
      return { message: "Comment not found" };
    }

    const updateData = {
      artworkId: commentData.artworkId
        ? String(commentData.artworkId).trim()
        : existingComment.artworkId,
      userId: commentData.userId
        ? String(commentData.userId).trim()
        : existingComment.userId,
      comment: commentData.comment
        ? String(commentData.comment).trim()
        : existingComment.comment,
      createdAt: existingComment.createdAt,
      updatedAt: new Date(),
    };

    const result = await collection.findOneAndUpdate(
      query,
      { $set: updateData },
      { returnDocument: "after" }, // MongoDB Native Driver-এ নতুন ডেটা রিটার্ন করার নিয়ম
    );

    // MongoDB native driver e আপডেট করা অবজেক্টটি সরাসরি result-এর ভেতর থাকে
    return result;
  }

  async delete(id) {
    if (!ObjectId.isValid(id)) throw new Error("Invalid Object ID format.");

    const collection = await getCollection("comments");
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return { message: "Comment not found" };
    }
    return { message: "Comment deleted successfully" };
  }
}

module.exports = new CommentController();
