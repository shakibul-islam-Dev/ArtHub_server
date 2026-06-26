const express = require("express");
const router = express.Router();
const {
  createSingleArtworkCheckout,
  confirmPaymentAndSaveOrder,
  getUserTransactionHistory,
} = require("../controllers/checkoutController");

// ১. চেকআউট সেশন তৈরি (Full URL: /api/arthub/checkout/single-artwork)
router.post("/checkout/single-artwork", createSingleArtworkCheckout);

// ২. পেমেন্ট কনফার্মেশন (Full URL: /api/arthub/checkout/confirm-payment)
router.post("/checkout/confirm-payment", confirmPaymentAndSaveOrder);

// ৩. ট্রানজেকশন হিস্ট্রি (Full URL: /api/arthub/checkout/history/:userId)
router.get("/checkout/history/:userId", getUserTransactionHistory);

module.exports = router;
