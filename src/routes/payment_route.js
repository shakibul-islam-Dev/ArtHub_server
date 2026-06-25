const express = require("express");
const paymentRouter = express.Router();
const Payment = require("../models/payment");

// ======================== GET ALL PAYMENTS ========================
paymentRouter.get("/", async (req, res) => {
  try {
    const payments = await Payment.find();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ======================== GET SINGLE PAYMENT ========================
paymentRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ======================== POST NEW PAYMENT ========================
paymentRouter.post("/", async (req, res) => {
  try {
    const {
      amount,
      user_id,
      artwork_id,
      date_uploaded,
      user, // ফ্রন্টএন্ড সেশন ডাটা
    } = req.body;

    // ভ্যালিডেশন চেক
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized access! No user information found.",
      });
    }

    if (user.role !== "artist") {
      return res.status(403).json({
        message: "Forbidden access! Only artists can post payments.",
      });
    }

    if (!amount) {
      return res.status(400).json({ message: "Please provide an amount" });
    }

    const newPayment = new Payment({
      amount,
      user_id: user?.id || user?._id,
      artwork_id,
      date_uploaded: date_uploaded || new Date(),
    });

    const savedPayment = await newPayment.save();
    res.status(201).json({
      success: true,
      message: "Payment added successfully",
      data: savedPayment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ======================== UPDATE PAYMENT ========================
paymentRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, user_id, artwork_id, date_uploaded, user } = req.body;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized access! No user information found.",
      });
    }

    if (user.role !== "artist") {
      return res.status(403).json({
        message: "Forbidden access! Only artists can post payments.",
      });
    }

    if (!amount) {
      return res.status(400).json({ message: "Please provide an amount" });
    }

    // আগের ডেটা চেক করার জন্য প্রথমে খোঁজা হচ্ছে (artist_name ধরে রাখার জন্য)
    const existingPayment = await Payment.findById(id);
    if (!existingPayment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const updateData = {
      amount,
      user_id: user?.id || user?._id,
      artwork_id,
      date_uploaded: date_uploaded || existingPayment.date_uploaded,
    };

    const updatedPayment = await Payment.findByIdAndUpdate(id, updateData, {
      new: true, // এর ফলে আপডেট হওয়া নতুন ডাটা রিটার্ন করবে
    });

    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: updatedPayment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ======================== DELETE PAYMENT ========================
paymentRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByIdAndDelete(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});
