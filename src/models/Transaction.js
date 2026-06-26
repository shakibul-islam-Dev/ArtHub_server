const { ObjectId } = require("mongodb");

class Transaction {
  static format(data) {
    if (
      data.amount === undefined ||
      data.amount === null ||
      isNaN(parseFloat(data.amount))
    ) {
      throw new Error("Amount is required and must be a valid number.");
    }
    if (!data.userId) throw new Error("User ID (userId) is required.");
    if (!data.artworkId) throw new Error("Artwork ID (artworkId) is required.");

    // ২. MongoDB ObjectId হ্যান্ডলিং (userId এর জন্য)
    let formattedUserId = null;
    if (data.userId) {
      const cleanUserId = data.userId.toString().trim();
      formattedUserId = ObjectId.isValid(cleanUserId)
        ? new ObjectId(cleanUserId)
        : cleanUserId;
    }

    let formattedArtworkId = null;
    if (data.artworkId) {
      const cleanArtworkId = data.artworkId.toString().trim();
      formattedArtworkId = ObjectId.isValid(cleanArtworkId)
        ? new ObjectId(cleanArtworkId)
        : cleanArtworkId;
    }

    return {
      amount: parseFloat(data.amount),
      userId: formattedUserId,
      artworkId: formattedArtworkId,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: new Date(),
    };
  }
}

module.exports = Transaction;
