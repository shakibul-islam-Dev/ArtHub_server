const express = require("express");
const artworkRouter = express.Router();
const { ObjectId } = require("mongodb");
const artworkController = require("../controllers/artworkControllers");

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

artworkRouter.get("/", artworkController.getAll);

artworkRouter.get("/:id", validateObjectId, artworkController.getById);

artworkRouter.post("/", artworkController.create);

artworkRouter.patch(
  "/:id/approve",
  validateObjectId,
  artworkController.approveArtwork,
);

artworkRouter.put("/:id", validateObjectId, artworkController.update);

artworkRouter.delete("/:id", validateObjectId, artworkController.delete);

module.exports = artworkRouter;
