const express = require("express");
const commentRouter = express.Router();
const {
  getAll,
  getById,
  create,
  update,
  deleteComment,
} = require("../controller/commentController");
const verifyToken = require("../middlewares/verifytoken");

// ======================== GET ALL COMMENTS ========================
commentRouter.get("/", async (req, res) => {
  try {
    const comments = await getAll();
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ======================== GET SINGLE COMMENT ========================
commentRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await getById(id);

    if (comment.message && comment.message === "Comment not found") {
      return res.status(404).json(comment);
    }

    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ======================== POST NEW COMMENT ========================
// POST NEW COMMENT
commentRouter.post("/", async (req, res) => {
  try {
    const { comment, artwork_id, user } = req.body;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized access! No user information found.",
      });
    }

    // Role check for both "artist" and "user"
    if (user.role !== "artist" && user.role !== "user") {
      return res.status(403).json({
        message: "Forbidden access! Only users and artists can post comments.",
      });
    }

    if (!comment || String(comment).trim() === "") {
      return res.status(400).json({ message: "Please provide a comment" });
    }

    const savedComment = await create({
      comment: comment,
      artworkId: artwork_id,
      userId: user?.id || user?._id,
    });

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: savedComment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// UPDATE COMMENT - Update this route similarly
commentRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, artwork_id, user } = req.body;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized access! No user information found.",
      });
    }

    // Role check for both "artist" and "user"
    if (user.role !== "artist" && user.role !== "user") {
      return res.status(403).json({
        message: "Forbidden access! Only users and artists can post comments.",
      });
    }

    if (!comment || String(comment).trim() === "") {
      return res.status(400).json({ message: "Please provide a comment" });
    }

    const updatedComment = await update(id, {
      comment: comment,
      artworkId: artwork_id,
      userId: user?.id || user?._id,
    });

    if (
      updatedComment.message &&
      updatedComment.message === "Comment not found"
    ) {
      return res.status(404).json(updatedComment);
    }

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: updatedComment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ======================== DELETE COMMENT ========================
commentRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await commentController.delete(id);

    if (result.message && result.message === "Comment not found") {
      return res.status(404).json(result);
    }

    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = commentRouter;
