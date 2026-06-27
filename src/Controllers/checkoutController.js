const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { ObjectId } = require("mongodb");
const { getCollection } = require("../config/database");

// =========================================================================
// ১. স্ট্রাইপ ওয়ান-টাইম পেমেন্ট সেশন তৈরি (Checkout Session)
// =========================================================================
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
        title: title || "Untitled Art", // ফ্রন্টএন্ডের জন্য মেটাডেটা ব্যাকআপ
        userId,
        userEmail,
        buyerName: userName || "Guest User", // ক্রেতার নাম ব্যাকআপ
        artistEmail: artistEmail || "Unknown Artist", // আর্টিস্টের ইমেইল ব্যাকআপ
        paymentType: "single_artwork",
      },
    });

    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error("Stripe single checkout error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// ২. পেমেন্ট ভেরিফাই এবং ডাটাবেজে (Native MongoDB) ট্রানজেকশন সেভ করা
// =========================================================================
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

    // মেটাডেটা থেকে সব প্রয়োজনীয় প্রোপার্টি ডিস্ট্রাকচার করা
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

    // ডুপ্লিকেট চেক (যাতে রিফ্রেশ দিলে একই ট্রানজেকশন ডাবল সেভ না হয়)
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

    // নতুন অবজেক্ট ফরম্যাট (আগের কি-গুলো অপরিবর্তিত রেখে অতিরিক্ত ফ্রন্টএন্ড ডাটা সহ)
    const newTransaction = {
      amount: amount,
      userId: formattedUserId,
      userEmail: userEmail ? userEmail.trim().toLowerCase() : null,
      artworkId: formattedArtworkId,

      // ফ্রন্টএন্ড ট্রানজেকশন পেজ যে ফিল্ডগুলো ম্যাপ করছে:
      artwork_title: title || "Untitled Art",
      buyer_name: buyerName || "Guest User",
      buyer_email: userEmail ? userEmail.trim().toLowerCase() : "No Email",
      artist_email: artistEmail || "Unknown Artist",

      createdAt: new Date(),
    };

    const result = await transactionsCollection.insertOne(newTransaction);
    newTransaction._id = result.insertedId;

    // পেমেন্ট সফল হওয়ার সাথে সাথে আর্টওয়ার্কের স্ট্যাটাস "sold" করার সেফটি কুয়েরি
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
// ৩. নির্দিষ্ট ইউজারের ট্রানজেকশন হিস্ট্রি তুলে আনা (Aggregation Lookup)
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
