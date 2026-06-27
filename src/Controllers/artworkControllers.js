const { ObjectId } = require("mongodb");
const { getCollection } = require("../config/database");

class ArtworkController {
  // ======================== GET ALL ARTWORKS ========================
  async getAll(req, res) {
    try {
      const { artist_id, isAdminPage } = req.query;

      // এখানে req.body ডিফাইনড না থাকলেও অপশনাল চেইনিং (?.) এর কারণে কোড ক্র্যাশ করবে না
      const rawArtistId =
        artist_id ||
        req.body?.user?.id ||
        req.body?.user?._id ||
        req.user?.id ||
        req.user?._id;

      let query = {};

      // ১. যদি অ্যাডমিন পেজ থেকে রিকোয়েস্ট আসে, তবে সব আর্টওয়ার্ক দেখাবে (পেন্ডিং + অ্যাপ্রুভড)
      if (isAdminPage === "true") {
        query = {};
      }
      // ২. যদি আর্টিস্টের নিজের পেজের জন্য রিকোয়েস্ট আসে
      else if (rawArtistId) {
        const cleanArtistId = rawArtistId.toString().trim();
        if (ObjectId.isValid(cleanArtistId)) {
          query.artist_id = new ObjectId(cleanArtistId);
        } else {
          query.artist_id = cleanArtistId;
        }
      }
      // ৩. পাবলিক ব্রাউজ পেজের জন্য শুধুমাত্র অ্যাপ্রুভড গুলো দেখাবে
      else {
        query.status = "approved";
      }

      const artworkCollection = await getCollection("artwork");
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
      const cleanId = id.trim();
      const artworkCollection = await getCollection("artwork");

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
        artist_id,
        artist_name,
        artist_profile_url,
        date_uploaded,
        user,
      } = req.body;

      if (!title || !description || !price || !category || !image_url) {
        return res.status(400).json({
          success: false,
          message: "Please provide all the required fields",
        });
      }

      const rawArtistId =
        artist_id || user?.id || user?._id || req.user?.id || req.user?._id;
      if (!rawArtistId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access! No artist information found.",
        });
      }

      let finalArtistId = rawArtistId.toString().trim();
      if (ObjectId.isValid(finalArtistId)) {
        finalArtistId = new ObjectId(finalArtistId);
      }

      const finalArtistName =
        artist_name || user?.name || req.user?.name || "Unknown Artist";
      const finalArtistProfile =
        artist_profile_url || user?.image || req.user?.image || "";

      const artworkCollection = await getCollection("artwork");

      const newArtwork = {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category: category.trim(),
        image_url: image_url.trim(),
        artist_id: finalArtistId,
        artist_name: finalArtistName,
        artist_profile_url: finalArtistProfile,
        isSold: req.body.isSold === true ? true : false,
        status: "pending",
        isApproved: false,
        date_uploaded: date_uploaded ? new Date(date_uploaded) : new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await artworkCollection.insertOne(newArtwork);
      newArtwork._id = result.insertedId;

      return res.status(201).json({
        success: true,
        message:
          "Successfully Saved to Database and waiting for admin approval!",
        ...newArtwork,
      });
    } catch (error) {
      console.error("POST Artwork Error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // ======================== ADMIN APPROVE ARTWORK ========================
  async approveArtwork(req, res) {
    try {
      const { id } = req.params;
      const cleanId = id.trim();
      const artworkCollection = await getCollection("artwork");

      const query = { $or: [{ _id: cleanId }] };
      if (ObjectId.isValid(cleanId)) {
        query.$or.push({ _id: new ObjectId(cleanId) });
      }

      const result = await artworkCollection.updateOne(query, {
        $set: {
          status: "approved",
          isApproved: true,
          updatedAt: new Date(),
        },
      });

      if (result.matchedCount === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Artwork not found" });
      }

      return res.status(200).json({
        success: true,
        message:
          "Artwork approved successfully! It is now visible on the browse page.",
      });
    } catch (error) {
      console.error("APPROVE Artwork Error:", error);
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
      const cleanId = id.trim();
      const {
        title,
        description,
        price,
        category,
        image_url,
        artist_id,
        artist_name,
        artist_profile_url,
        date_uploaded,
        isSold,
        status,
        isApproved,
        user,
      } = req.body;

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

      const existingArtwork = await artworkCollection.findOne(query);
      if (!existingArtwork) {
        return res
          .status(404)
          .json({ success: false, message: "Artwork not found" });
      }

      const rawArtistId =
        artist_id ||
        user?.id ||
        user?._id ||
        req.user?.id ||
        req.user?._id ||
        existingArtwork.artist_id;
      let finalArtistId = rawArtistId.toString().trim();
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
        artist_name:
          artist_name ||
          user?.name ||
          req.user?.name ||
          existingArtwork.artist_name,
        artist_profile_url:
          artist_profile_url ||
          user?.image ||
          req.user?.image ||
          existingArtwork.artist_profile_url,
        isSold: typeof isSold === "boolean" ? isSold : existingArtwork.isSold,
        status: status || existingArtwork.status,
        isApproved:
          typeof isApproved === "boolean"
            ? isApproved
            : existingArtwork.isApproved,
        date_uploaded: date_uploaded
          ? new Date(date_uploaded)
          : existingArtwork.date_uploaded,
        updatedAt: new Date(),
      };

      const result = await artworkCollection.findOneAndUpdate(
        query,
        { $set: updateData },
        { returnDocument: "after" },
      );

      const updatedArtwork = result && result.value ? result.value : result;

      if (!updatedArtwork) {
        return res
          .status(404)
          .json({ success: false, message: "Failed to update artwork" });
      }

      return res.status(200).json({
        success: true,
        message: "Artwork updated successfully",
        ...updatedArtwork,
      });
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
      const cleanId = id.trim();
      const artworkCollection = await getCollection("artwork");

      const query = { $or: [{ _id: cleanId }] };
      if (ObjectId.isValid(cleanId)) {
        query.$or.push({ _id: new ObjectId(cleanId) });
      }

      const result = await artworkCollection.deleteOne(query);

      if (result.deletedCount === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Artwork not found" });
      }

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
