const express = require("express");
const userRouter = express.Router();

// ফাইলপাথ এবং ক্যাপিটালাইজেশন ঠিক রাখা হয়েছে (কন্ট্রোলার ফাইলের নামের সাথে মিল রেখে)
const userController = require("../controllers/userController");

// ======================== ROUTES ========================

// ১. সব ইউজারদের ডাটা নিয়ে আসা
userRouter.get("/", userController.getAll);

// ২. রোল অনুযায়ী নির্দিষ্ট সিঙ্গেল ইউজার খোঁজা
userRouter.get("/role", userController.getCurrentUserByRole);

// ৩. নতুন ইউজার তৈরি বা সাইনআপ হ্যান্ডেল করা
userRouter.post("/", userController.create);

// ৪. নির্দিষ্ট আইডি ধরে সিঙ্গেল ইউজার খোঁজা
userRouter.get("/:id", userController.getById);

// ৫. ইউজারের তথ্য বা রোল পরিবর্তন/আপডেট করা
userRouter.put("/:id", userController.update);

// ৬. অ্যাডমিন প্যানেল থেকে ইউজার, আর্টিস্ট বা যে কাউকে ডিলিট করা
userRouter.delete("/:id", userController.delete);

module.exports = userRouter;
