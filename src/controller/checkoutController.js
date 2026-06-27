const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { ObjectId } = require("mongodb");
const { getCollection } = require("../config/database");

const createSingleArtworkCheckout = async (req, res) => {
  try {
    const {
      artworkId,
      title,
      price,
      imageUrl,
      userId,
      userEmail,
      userName,
      artistEmail,
    } = req.body;

    if (!price || price <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid artwork price" });
    }

    let baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:5000";

    if (baseUrl.includes(":5000")) {
      baseUrl = baseUrl.replace(":5000", ":3000");
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: title || "Exclusive Artwork",
              images: imageUrl ? [imageUrl] : [],
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/dashboard/user/purchased-history?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/artwork/${artworkId}`,
      metadata: {
        artworkId,
        title: title || "Untitled Art",
        userId,
        userEmail,
        buyerName: userName || "Guest User",
        artistEmail: artistEmail || "Unknown Artist",
        paymentType: "single_artwork",
      },
    });

    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error("Stripe single checkout error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const confirmPaymentAndSaveOrder = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res
        .status(400)
        .json({ success: false, message: "Session ID is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res
        .status(400)
        .json({ success: false, message: "Payment not completed yet" });
    }

    const { artworkId, title, userId, userEmail, buyerName, artistEmail } =
      session.metadata;
    const amount = session.amount_total / 100;

    const transactionsCollection = await getCollection("transactions");

    const formattedArtworkId = ObjectId.isValid(artworkId)
      ? new ObjectId(artworkId)
      : artworkId;
    const formattedUserId = ObjectId.isValid(userId)
      ? new ObjectId(userId)
      : userId;

    const existingTransaction = await transactionsCollection.findOne({
      artworkId: formattedArtworkId,
      userId: formattedUserId,
    });

    if (existingTransaction) {
      return res.status(200).json({
        success: true,
        message: "Transaction already recorded.",
        transaction: existingTransaction,
      });
    }

    const newTransaction = {
      amount: amount,
      userId: formattedUserId,
      userEmail: userEmail ? userEmail.trim().toLowerCase() : null,
      artworkId: formattedArtworkId,

      artwork_title: title || "Untitled Art",
      buyer_name: buyerName || "Guest User",
      buyer_email: userEmail ? userEmail.trim().toLowerCase() : "No Email",
      artist_email: artistEmail || "Unknown Artist",

      createdAt: new Date(),
    };

    const result = await transactionsCollection.insertOne(newTransaction);
    newTransaction._id = result.insertedId;

    try {
      const artworkCollection = await getCollection("artwork");
      const artQuery = { $or: [{ _id: artworkId }] };
      if (ObjectId.isValid(artworkId)) {
        artQuery.$or.push({ _id: new ObjectId(artworkId) });
      }
      await artworkCollection.updateOne(artQuery, {
        $set: { isSold: true, status: "sold", updatedAt: new Date() },
      });
    } catch (artErr) {
      console.error("Failed to update artwork status to sold:", artErr);
    }

    res.status(200).json({
      success: true,
      message: "Payment verified and saved to MongoDB successfully!",
      transaction: newTransaction,
    });
  } catch (error) {
    console.error("MongoDB native save error after checkout:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error: " + error.message });
  }
};

// =========================================================================
//(Aggregation Lookup)
// =========================================================================
const getUserTransactionHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const transactionsCollection = await getCollection("transactions");

    const formattedUserId = ObjectId.isValid(userId)
      ? new ObjectId(userId)
      : userId;

    // Native Aggregation Pipeline
    const history = await transactionsCollection
      .aggregate([
        {
          $match: { userId: formattedUserId },
        },
        {
          $lookup: {
            from: "artwork",
            localField: "artworkId",
            foreignField: "_id",
            as: "artworkId",
          },
        },
        {
          $unwind: {
            path: "$artworkId",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray();

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    console.error("Fetch transaction history error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createSingleArtworkCheckout,
  confirmPaymentAndSaveOrder,
  getUserTransactionHistory,
};
