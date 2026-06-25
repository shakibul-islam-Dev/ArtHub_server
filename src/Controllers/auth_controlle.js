const User = require("../models/User");

class AuthController {
  async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      return { message: "User not found" };
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return { message: "Incorrect password" };
    }

    const token = user.generateJWT();
    return { message: "Login successful", token };
  }

  async register(name, email, password, role, image_url, date_registered) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { message: "User already exists" };
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
    return { message: "User added successfully", token };
  }
}

module.exports = new AuthController();
