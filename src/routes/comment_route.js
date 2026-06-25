const express = require("express");
const commentRouter = express.Router();
const Comment = require("../models/comment"); // 👈 আপনার Mongoose Model

// ======================== GET ALL COMMENTS ========================
commentRouter.get("/", async (req, res) => {
  try {
    const comments = await Comment.find();
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ======================== GET SINGLE COMMENT ========================
commentRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ======================== POST NEW COMMENT ========================
commentRouter.post("/", async (req, res) => {
  try {
    const {
      comment,
      user_id,
      artwork_id,
      date_uploaded,
      user, // ফ্রন্টএন্ড সেশন ডাটা
    } = req.body;

    // ভ্যালিডেশন চেক
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized access! No user information found.",
      });
    }

    if (user.role !== "artist") {
      return res.status(403).json({
        message: "Forbidden access! Only artists can post comments.",
      });
    }

    if (!comment) {
      return res.status(400).json({ message: "Please provide a comment" });
    }

    const newComment = new Comment({
      comment,
      user_id: user?.id || user?._id,
      artwork_id,
      date_uploaded: date_uploaded || new Date(),
    });

    const savedComment = await newComment.save();
    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: savedComment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ======================== UPDATE COMMENT ========================
commentRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, user_id, artwork_id, date_uploaded, user } = req.body;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized access! No user information found.",
      });
    }

    if (user.role !== "artist") {
      return res.status(403).json({
        message: "Forbidden access! Only artists can post comments.",
      });
    }

    if (!comment) {
      return res.status(400).json({ message: "Please provide a comment" });
    }

    // আগের ডেটা চেক করার জন্য প্রথমে খোঁজা হচ্ছে (artist_name ধরে রাখার জন্য)
    const existingComment = await Comment.findById(id);
    if (!existingComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const updateData = {
      comment,
      user_id: user?.id || user?._id,
      artwork_id,
      date_uploaded: date_uploaded || existingComment.date_uploaded,
    };

    const updatedComment = await Comment.findByIdAndUpdate(id, updateData, {
      new: true, // এর ফলে আপডেট হওয়া নতুন ডাটা রিটার্ন করবে
    });

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: updatedComment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ======================== DELETE COMMENT ========================
commentRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByIdAndDelete(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = commentRouter;
