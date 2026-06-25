const { ObjectId } = require("mongodb");
const { getCollection } = require("../config/database");

class UserController {
  // 🎯 ১. সরাসরি রোলের ওপর ভিত্তি করে "১টি পিওর অবজেক্ট" পাঠানো (কোনো অ্যারে বা রেপার ছাড়া)
  getCurrentUserByRole = async (req, res) => {
    try {
      const userRole = req.query.role || req.headers["x-user-role"] || "artist";
      const safeRole = userRole.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

      const userCollection = await getCollection("user");

      // findOne সবসময় সরাসরি ১টি পিওর অবজেক্ট দেয়
      const user = await userCollection.findOne({
        role: { $regex: `^${safeRole}$`, $options: "i" },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: `No user found with role: ${userRole}`,
        });
      }

      // 🎯 সরাসরি অবজেক্ট রিটার্ন (পোস্টম্যানে { _id: "...", name: "..." } এভাবে আসবে)
      return res.status(200).json(user);
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Server error",
          error: error.message,
        });
    }
  };

  // 📊 ২. সব ইউজার গেট করা
  getAll = async (req, res) => {
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
      return res
        .status(500)
        .json({
          success: false,
          message: "Server error",
          error: error.message,
        });
    }
  };

  // 🔍 ৩. আইডি দিয়ে নির্দিষ্ট ইউজার খোঁজা (পিওর অবজেক্ট রিটার্ন)
  getById = async (req, res) => {
    try {
      const { id } = req.params;
      if (!id)
        return res
          .status(400)
          .json({ success: false, message: "User ID is required" });

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

      // 🎯 সরাসরি অবজেক্ট রিটার্ন
      return res.status(200).json(user);
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Server error",
          error: error.message,
        });
    }
  };

  // ➕ ৪. নতুন ইউজার তৈরি করা
  create = async (req, res) => {
    try {
      const user = req.body;
      if (!user._id || !user.name || !user.email) {
        return res
          .status(400)
          .json({
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

      // 🎯 তৈরি হওয়া নতুন ইউজার অবজেক্ট সরাসরি রিটার্ন
      return res.status(201).json(newUser);
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Server error",
          error: error.message,
        });
    }
  };

  // 📝 ৫. প্রোফাইল আপডেট (ড্রাইভার ভার্সন সেফ পিওর অবজেক্ট রিটার্ন)
  update = async (req, res) => {
    try {
      const { id } = req.params;
      if (!id)
        return res
          .status(400)
          .json({ success: false, message: "User ID is required" });

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

      if (!result) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // মঙ্গোডিবি ড্রাইভারে যদি .value থাকে তবে সেটা নেবে, না থাকলে সরাসরি ডক নেবে
      const updatedUser = result.value !== undefined ? result.value : result;

      if (!updatedUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // 🎯 আপডেটেড আপ টু ডেট পিওর অবজেক্ট রিটার্ন
      return res.status(200).json(updatedUser);
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Server error",
          error: error.message,
        });
    }
  };

  // ❌ ⁶. ইউজার ডিলিট
  delete = async (req, res) => {
    try {
      const { id } = req.params;
      if (!id)
        return res
          .status(400)
          .json({ success: false, message: "User ID is required" });

      const cleanId = id.trim();
      const userCollection = await getCollection("user");

      const query = { $or: [{ _id: cleanId }] };
      if (ObjectId.isValid(cleanId)) {
        query.$or.push({ _id: new ObjectId(cleanId) });
      }

      const result = await userCollection.findOneAndDelete(query);

      if (!result) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const deletedUser = result.value !== undefined ? result.value : result;

      if (!deletedUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // 🎯 ডিলিট হওয়া অবজেক্টটি সরাসরি রিটার্ন করে দেওয়া হলো
      return res.status(200).json(deletedUser);
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Server error",
          error: error.message,
        });
    }
  };
}

module.exports = new UserController();
