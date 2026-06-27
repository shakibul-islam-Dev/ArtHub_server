const express = require("express");
const router = express.Router();
const {
  createSingleArtworkCheckout,
  confirmPaymentAndSaveOrder,
  getUserTransactionHistory,
} = require("../controllers/checkoutController");

router.post("/checkout/single-artwork", createSingleArtworkCheckout);

router.post("/checkout/confirm-payment", confirmPaymentAndSaveOrder);

router.get("/checkout/history/:userId", getUserTransactionHistory);

module.exports = router;
