const express = require("express");
const userRouter = express.Router();

const {
  getCurrentUserByRole,
  getAll,
  getById,
  create,
  update,
  deleteUser,
} = require("../controller/userController");
const verifyToken = require("../middlewares/verifytoken");

userRouter.get("/", verifyToken, getAll);

userRouter.get("/role", verifyToken, getCurrentUserByRole);

userRouter.post("/", verifyToken, create);
userRouter.get("/:id", verifyToken, getById);
userRouter.put("/:id", verifyToken, update);
userRouter.delete("/:id", verifyToken, deleteUser);

module.exports = userRouter;
