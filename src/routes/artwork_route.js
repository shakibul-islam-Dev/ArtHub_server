const express = require("express");
const artworkRouter = express.Router();
const { ObjectId } = require("mongodb"); // 🎯 মঙ্গুসের পরিবর্তে নেটিভ ড্রাইভার ইম্পোর্ট
const artworkController = require("../controllers/artworkController");

const validateObjectId = (req, res, next) => {
  const { id } = req.params;

  if (!id || id.trim() === "") {
    return res
      .status(400)
      .json({ success: false, message: "Artwork ID is required." });
  }

  const cleanId = id.trim();
  if (cleanId.length === 24 && !ObjectId.isValid(cleanId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Artwork ID format." });
  }

  next();
};

// ======================== রাউট ম্যাপিং ========================
artworkRouter.get("/", artworkController.getAll);
artworkRouter.get("/:id", validateObjectId, artworkController.getById);
artworkRouter.post("/", artworkController.create);
artworkRouter.put("/:id", validateObjectId, artworkController.update);
artworkRouter.delete("/:id", validateObjectId, artworkController.delete);

module.exports = artworkRouter;
