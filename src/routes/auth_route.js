const express = require("express");
const authRouter = express.Router();
const User = require("../models/user");

// ======================== LOGIN ========================
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all the required fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = user.generateJWT();
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ======================== REGISTER ========================
authRouter.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, image_url, date_registered } =
      req.body;

    if (!name || !email || !password || !role || !image_url) {
      return res
        .status(400)
        .json({ message: "Please provide all the required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const newUser = new User({
      name,
      email,
      password,
      role,
      image_url,
      date_registered: date_registered || new Date(),
    });

    const savedUser = await newUser.save();
    const token = savedUser.generateJWT();
    res.status(201).json({
      success: true,
      message: "User added successfully",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = authRouter;
