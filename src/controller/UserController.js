const { ObjectId } = require("mongodb");
const { getCollection } = require("../config/database");

// ======================== GET CURRENT USER BY ROLE ========================
const getCurrentUserByRole = async (req, res) => {
  try {
    const userRole = req.query.role || req.headers["x-user-role"] || "artist";
    const safeRole = userRole.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

    const userCollection = await getCollection("user");

    const user = await userCollection.findOne({
      role: { $regex: `^${safeRole}$`, $options: "i" },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No user found with role: ${userRole}`,
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================== GET ALL USERS & ARTISTS ========================
const getAll = async (req, res) => {
  try {
    const userCollection = await getCollection("user");
    const users = await userCollection.find({}).toArray();
    const totalUsers = await userCollection.countDocuments({});

    const roleCounts = {
      artist: users.filter((u) => u.role?.toLowerCase() === "artist").length,
      admin: users.filter((u) => u.role?.toLowerCase() === "admin").length,
      user: users.filter((u) => u.role?.toLowerCase() === "user").length,
    };

    return res.status(200).json({
      success: true,
      total: totalUsers,
      roles: roleCounts,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================== GET BY ID ========================
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const cleanId = id.trim();
    const userCollection = await getCollection("user");

    const query = { $or: [{ _id: cleanId }] };
    if (ObjectId.isValid(cleanId)) {
      query.$or.push({ _id: new ObjectId(cleanId) });
    }

    const user = await userCollection.findOne(query);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================== CREATE USER ========================
const create = async (req, res) => {
  try {
    const user = req.body;
    if (!user._id || !user.name || !user.email) {
      return res.status(400).json({
        success: false,
        message: "_id, name, and email are required",
      });
    }

    const userCollection = await getCollection("user");

    const newUser = {
      _id: user._id.trim(),
      name: user.name.trim(),
      email: user.email.trim().toLowerCase(),
      password: user.password || "",
      role: user.role || "user",
      plan: user.plan || "free",
      image: user.image || "",
      emailVerified: user.emailVerified || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await userCollection.insertOne(newUser);
    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================== UPDATE USER / ROLE CHANGE ========================
const update = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const cleanId = id.trim();
    const incomingData = req.body;
    const userCollection = await getCollection("user");

    const updateData = {};
    const allowedFields = [
      "name",
      "email",
      "password",
      "role",
      "plan",
      "image",
      "emailVerified",
    ];

    allowedFields.forEach((field) => {
      if (incomingData[field] !== undefined) {
        updateData[field] =
          field === "email"
            ? incomingData[field].trim().toLowerCase()
            : incomingData[field];
      }
    });

    updateData.updatedAt = new Date();

    const query = { $or: [{ _id: cleanId }] };
    if (ObjectId.isValid(cleanId)) {
      query.$or.push({ _id: new ObjectId(cleanId) });
    }

    const result = await userCollection.findOneAndUpdate(
      query,
      { $set: updateData },
      { returnDocument: "after" },
    );

    const updatedUser =
      result && result.value !== undefined ? result.value : result;

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found for update" });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================== DELETE USER / ARTIST ========================
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const cleanId = id.trim();
    const userCollection = await getCollection("user");

    const query = { $or: [{ _id: cleanId }] };
    if (ObjectId.isValid(cleanId)) {
      query.$or.push({ _id: new ObjectId(cleanId) });
    }

    const existingUser = await userCollection.findOne(query);
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const deleteResult = await userCollection.deleteOne(query);

    if (deleteResult.deletedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Failed to delete user" });
    }

    return res.status(200).json({
      success: true,
      message: "User/Artist deleted successfully from database",
      deletedUser: existingUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getCurrentUserByRole,
  getAll,
  getById,
  create,
  update,
  deleteUser,
};
