const express = require("express");
const artworkRouter = express.Router();
const { ObjectId } = require("mongodb");
const {
  getAll,
  getById,
  create,
  approveArtwork,
  update,
  deleteArtwork,
} = require("../controller/artworkController");
const verifyToken = require("../middlewares/verifytoken");

const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!id || id.trim() === "") {
    return res
      .status(400)
      .json({ success: false, message: "Artwork ID is required." });
  }
  const cleanId = id.trim();
  if (!ObjectId.isValid(cleanId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Artwork ID format." });
  }
  req.params.id = cleanId;
  next();
};

artworkRouter.get("/", getAll);

artworkRouter.get("/:id", validateObjectId, getById);
artworkRouter.post("/", create);
artworkRouter.patch(
  "/:id/approve",
  validateObjectId,

  approveArtwork,
);

artworkRouter.put("/:id", validateObjectId, update);
artworkRouter.delete("/:id", validateObjectId, deleteArtwork);

module.exports = artworkRouter;
