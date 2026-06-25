const { ObjectId } = require("mongodb");

class Artwork {
  /**
   * ডাটাবেজে আর্টওয়ার্ক ইনসার্ট বা আপডেট করার আগে ডেটা ফরম্যাট ও ডিফল্ট ভ্যালু সেট করার জন্য
   * @param {Object} data - রিকোয়েস্ট বডি বা ইনকামিং ডেটা
   */
  static format(data) {
    if (!data.artist_id) throw new Error("Artist ID (artist_id) is required.");
    if (!data.title) throw new Error("Title is required.");
    if (!data.image_url) throw new Error("Image URL is required.");
    if (!data.description) throw new Error("Description is required.");
    if (data.price === undefined || data.price === null)
      throw new Error("Price is required.");
    if (!data.category) throw new Error("Category is required.");

    // আর্টিস্ট আইডি অবজেক্ট আইডি বা পিওর স্ট্রিং দুটোই হতে পারে, তাই সেফলি হ্যান্ডেল করা হলো
    let formattedArtistId = data.artist_id.toString().trim();
    if (ObjectId.isValid(formattedArtistId)) {
      formattedArtistId = new ObjectId(formattedArtistId);
    }

    // মঙ্গুস স্কিমার মতো ডিফল্ট ভ্যালু, ট্রিম (Trim) এবং টাইপ কাস্টিং হ্যান্ডেল করা হলো
    return {
      artist_id: formattedArtistId,
      title: String(data.title).trim(),
      image_url: String(data.image_url).trim(),
      artist_name: data.artist_name
        ? String(data.artist_name).trim()
        : "Unknown Artist",
      artist_profile_url: data.artist_profile_url
        ? String(data.artist_profile_url).trim()
        : "",
      description: String(data.description).trim(),
      price: parseFloat(data.price),
      category: String(data.category).trim(),
      isSold: typeof data.isSold === "boolean" ? data.isSold : false,
      date_uploaded: data.date_uploaded
        ? new Date(data.date_uploaded)
        : new Date(),
      createdAt: data.createdAt || new Date(),
      updatedAt: new Date(),
    };
  }
}

module.exports = Artwork;
