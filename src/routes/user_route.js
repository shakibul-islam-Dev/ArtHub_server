const express = require("express");
const userRouter = express.Router();
const UserController = require("../controllers/UserController");

// ==================== ১. স্ট্যাটিক বা স্পেসিফিক রাউটস ====================
// (ভবিষ্যতে কোনো স্পেসিফিক রুট যেমন /search বা /current লাগলে সেগুলো এখানে লিখবে)
// userRouter.get("/current", UserController.getCurrentUserByRole);

// ==================== ২. বেজ রাউটস (আইডি ছাড়া) ====================
userRouter.get("/", UserController.getAll);
userRouter.post("/", UserController.create);

// ==================== ৩. ডাইনামিক রাউটস (আইডি সহ - সবসময় নিচে) ====================
// 👑 আইডি দিয়ে খোঁজার রুট
userRouter.get("/:id", UserController.getById);
userRouter.put("/:id", UserController.update);
userRouter.delete("/:id", UserController.delete);

module.exports = userRouter;
