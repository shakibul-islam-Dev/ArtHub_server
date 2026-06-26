const { ObjectId } = require("mongodb");
const { getCollection } = require("../config/database");

class ArtworkController {
  // ======================== GET ALL ARTWORKS ========================
  async getAll(req, res) {
    try {
      // ১. ফ্রন্টএন্ড থেকে পাঠানো কোয়েরি প্যারামিটার রিড করা হচ্ছে
      const { artist_id } = req.query;

      // ২. যদি কোয়েরিতে artist_id থাকে তবে ফিল্টার অবজেক্ট তৈরি হবে
      let query = {};
      if (artist_id) {
        // ডাইনামিক সেফটি চেক: আইডি যদি মঙ্গোডিবির ২৪ অক্ষরের অবজেক্ট আইডি ফরম্যাট হয়
        if (ObjectId.isValid(artist_id.trim())) {
          query.artist_id = new ObjectId(artist_id.trim());
        } else {
          query.artist_id = artist_id.trim(); // পিওর স্ট্রিং আইডি হলে
        }
      }

      const artworkCollection = await getCollection("artwork");

      // ৩. ডাটাবেজ থেকে কুয়েরি অনুযায়ী ডেটা ফেচ করে সরাসরি অ্যারে রিটার্ন করা হচ্ছে
      const artworks = await artworkCollection.find(query).toArray();

      return res.status(200).json(artworks);
    } catch (error) {
      console.error("GET artwork Error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // ======================== GET SINGLE ARTWORK ========================
  async getById(req, res) {
    try {
      const { id } = req.params;
      if (!id)
        return res
          .status(400)
          .json({ success: false, message: "Artwork ID is required" });

      const cleanId = id.trim();
      const artworkCollection = await getCollection("artwork");

      // স্ট্রিং এবং অবজেক্ট আইডি দুটোর জন্যই কুয়েরি রেডি করা
      const query = { $or: [{ _id: cleanId }] };
      if (ObjectId.isValid(cleanId)) {
        query.$or.push({ _id: new ObjectId(cleanId) });
      }

      const artwork = await artworkCollection.findOne(query);

      if (!artwork) {
        return res
          .status(404)
          .json({ success: false, message: "Artwork not found" });
      }

      // সরাসরি পিওর অবজেক্ট রিটার্ন
      return res.status(200).json(artwork);
    } catch (error) {
      console.error("GET Single Artwork Error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // ======================== POST NEW ARTWORK ========================
  async create(req, res) {
    try {
      const {
        title,
        description,
        price,
        category,
        image_url,
        artist_profile_url,
        date_uploaded,
        artist_id,
        user,
      } = req.body;

      // অথরাইজেশন চেক
      if (!user && !artist_id) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access! No artist information found.",
        });
      }

      if (user && user.role !== "artist") {
        return res.status(403).json({
          success: false,
          message: "Forbidden access! Only artists can post artwork.",
        });
      }

      // ফিল্ড ভ্যালিডেশন
      if (!title || !description || !price || !category || !image_url) {
        return res.status(400).json({
          success: false,
          message: "Please provide all the required fields",
        });
      }

      // আর্টিস্ট আইডি ফিল্টার
      const rawArtistId = artist_id || user?.id || user?._id;
      let finalArtistId = rawArtistId?.toString().trim();
      if (ObjectId.isValid(finalArtistId)) {
        finalArtistId = new ObjectId(finalArtistId);
      }

      const artworkCollection = await getCollection("artwork");

      const newArtwork = {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category: category.trim(),
        image_url: image_url.trim(),
        artist_id: finalArtistId,
        artist_name: user?.name || "Unknown Artist",
        artist_profile_url: artist_profile_url || user?.image || "",
        date_uploaded: date_uploaded ? new Date(date_uploaded) : new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // মঙ্গোডিবি নেটিভ ড্রাইভার দিয়ে ডাটা ইনসার্ট করা হচ্ছে
      const result = await artworkCollection.insertOne(newArtwork);

      // ইনসার্ট হওয়া নতুন ডেটাতে জেনারেট হওয়া আইডিটি বসিয়ে দেওয়া হচ্ছে
      newArtwork._id = result.insertedId;

      // সরাসরি তৈরি হওয়া নতুন পিওর অবজেক্ট রিটার্ন
      return res.status(201).json(newArtwork);
    } catch (error) {
      console.error("POST Artwork Error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // ======================== UPDATE ARTWORK ========================
  async update(req, res) {
    try {
      const { id } = req.params;
      if (!id)
        return res
          .status(400)
          .json({ success: false, message: "Artwork ID is required" });

      const cleanId = id.trim();
      const {
        title,
        description,
        price,
        category,
        image_url,
        artist_profile_url,
        date_uploaded,
        artist_id,
        user,
      } = req.body;

      if (!user && !artist_id) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access! No artist information found.",
        });
      }

      if (user && user.role !== "artist") {
        return res.status(403).json({
          success: false,
          message: "Forbidden access! Only artists can post artwork.",
        });
      }

      if (!title || !description || !price || !category || !image_url) {
        return res.status(400).json({
          success: false,
          message: "Please provide all the required fields",
        });
      }

      const artworkCollection = await getCollection("artwork");

      const query = { $or: [{ _id: cleanId }] };
      if (ObjectId.isValid(cleanId)) {
        query.$or.push({ _id: new ObjectId(cleanId) });
      }

      // এক্সিস্টিং ডাটা চেক
      const existingArtwork = await artworkCollection.findOne(query);
      if (!existingArtwork) {
        return res
          .status(404)
          .json({ success: false, message: "Artwork not found" });
      }

      const rawArtistId = artist_id || user?.id || user?._id;
      let finalArtistId = rawArtistId?.toString().trim();
      if (ObjectId.isValid(finalArtistId)) {
        finalArtistId = new ObjectId(finalArtistId);
      }

      const updateData = {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category: category.trim(),
        image_url: image_url.trim(),
        artist_id: finalArtistId,
        artist_name: user?.name || existingArtwork.artist_name,
        artist_profile_url:
          artist_profile_url ||
          user?.image ||
          existingArtwork.artist_profile_url,
        date_uploaded: date_uploaded
          ? new Date(date_uploaded)
          : existingArtwork.date_uploaded,
        updatedAt: new Date(),
      };

      // findOneAndUpdate দিয়ে আপডেটেড ডাটা রিটার্ন পাওয়া নিশ্চিত করা
      const result = await artworkCollection.findOneAndUpdate(
        query,
        { $set: updateData },
        { returnDocument: "after" },
      );

      const updatedArtwork = result.value !== undefined ? result.value : result;

      if (!updatedArtwork) {
        return res
          .status(404)
          .json({ success: false, message: "Artwork not found" });
      }

      // সরাসরি আপডেটেড পিওর অবজেক্ট রিটার্ন
      return res.status(200).json(updatedArtwork);
    } catch (error) {
      console.error("PUT Artwork Error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // ======================== DELETE ARTWORK ========================
  async delete(req, res) {
    try {
      const { id } = req.params;
      if (!id)
        return res
          .status(400)
          .json({ success: false, message: "Artwork ID is required" });

      const cleanId = id.trim();
      const artworkCollection = await getCollection("artwork");

      // কুয়েরি তৈরি
      const query = { $or: [{ _id: cleanId }] };
      if (ObjectId.isValid(cleanId)) {
        query.$or.push({ _id: new ObjectId(cleanId) });
      }

      // সঠিক ডিলিট মেথড (নেটিভ ড্রাইভারের জন্য)
      const result = await artworkCollection.deleteOne(query);

      // result.deletedCount চেক করা সবচেয়ে নিরাপদ পদ্ধতি
      if (result.deletedCount === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Artwork not found" });
      }

      // সাকসেস রেসপন্স
      return res.status(200).json({
        success: true,
        message: "Artwork deleted successfully",
      });
    } catch (error) {
      console.error("DELETE Artwork Error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }
}

module.exports = new ArtworkController();
