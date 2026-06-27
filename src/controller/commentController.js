const { ObjectId } = require("mongodb");
const Comment = require("../models/Comment");
const { getCollection } = require("../config/database");

// ======================== GET ALL COMMENTS ========================
const getAll = async () => {
  const collection = await getCollection("comments");
  const comments = await collection.find({}).toArray();
  return comments;
};

// ======================== GET SINGLE COMMENT BY ID ========================
const getById = async (id) => {
  if (!ObjectId.isValid(id)) throw new Error("Invalid Object ID format.");

  const collection = await getCollection("comments");
  const comment = await collection.findOne({ _id: new ObjectId(id) });

  if (!comment) {
    return { message: "Comment not found" };
  }
  return comment;
};

// ======================== CREATE NEW COMMENT ========================
const create = async (commentData) => {
  const collection = await getCollection("comments");

  const formattedComment = Comment.format(commentData);

  const result = await collection.insertOne(formattedComment);

  return {
    _id: result.insertedId,
    ...formattedComment,
  };
};

// ======================== UPDATE COMMENT ========================
const update = async (id, commentData) => {
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
    { returnDocument: "after" },
  );

  return result;
};

// ======================== DELETE COMMENT ========================
const deleteComment = async (id) => {
  if (!ObjectId.isValid(id)) throw new Error("Invalid Object ID format.");

  const collection = await getCollection("comments");
  const result = await collection.deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return { message: "Comment not found" };
  }
  return { message: "Comment deleted successfully" };
};

// সবগুলো মেথড অবজেক্ট প্রপার্টি হিসেবে এক্সপোর্ট করা হলো
module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteComment, // 'delete' কিওয়ার্ডের সাথে 'deleteComment' ফাংশন ম্যাপ করা হলো
};
