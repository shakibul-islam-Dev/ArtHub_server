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

userRouter.get("/", getAll);

userRouter.get("/role", getCurrentUserByRole);

userRouter.post("/", create);

userRouter.get("/:id", getById);

userRouter.put("/:id", update);

userRouter.delete("/:id", deleteUser);

module.exports = userRouter;
