const express = require("express");
const artworkRouter = express.Router();
const { ObjectId } = require("mongodb");
const artworkController = require("../controllers/artworkController");

// ======================== মিডলওয়্যার ========================
/**
 * MongoDB ObjectId ভ্যালিডেশন মিডলওয়্যার
 */
const validateObjectId = (req, res, next) => {
  const { id } = req.params;

  if (!id || id.trim() === "") {
    return res
      .status(400)
      .json({ success: false, message: "Artwork ID is required." });
  }

  const cleanId = id.trim();
  // MongoDB-এর সঠিক ObjectId ফরম্যাট (২৪ অক্ষরের হেক্সাডেসিমেল) চেক করা
  if (!ObjectId.isValid(cleanId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Artwork ID format." });
  }

  // রিকোয়েস্ট অবজেক্টে ক্লিন করা আইডি পাস করে দেওয়া যেন কন্ট্রোলারে সরাসরি ব্যবহার করা যায়
  req.params.id = cleanId;
  next();
};

// ======================== রাউট ম্যাপিং ========================

// ১. সব আর্টওয়ার্ক নিয়ে আসা (আর্টিস্টের নিজের পেজে সব স্ট্যাটাস এবং পাবলিক পেজে শুধু approved দেখাবে)
artworkRouter.get("/", artworkController.getAll);

// ২. নির্দিষ্ট আইডি অনুযায়ী আর্টওয়ার্ক দেখা
artworkRouter.get("/:id", validateObjectId, artworkController.getById);

// ৩. নতুন আর্টওয়ার্ক আপলোড করা (ডিফল্ট স্ট্যাটাস "pending" হিসেবে সেভ হবে)
artworkRouter.post("/", artworkController.create);

// ৪. অ্যাডমিন কর্তৃক আর্টওয়ার্ক অনুমোদন (Approval Route)
artworkRouter.patch(
  "/:id/approve",
  validateObjectId,
  artworkController.approveArtwork,
);

// ৫. আর্টওয়ার্ক আপডেট করা
artworkRouter.put("/:id", validateObjectId, artworkController.update);

// ৬. আর্টওয়ার্ক ডিলিট করা
artworkRouter.delete("/:id", validateObjectId, artworkController.delete);

module.exports = artworkRouter;
