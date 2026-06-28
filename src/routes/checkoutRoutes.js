const express = require("express");
const router = express.Router();
const {
  createSingleArtworkCheckout,
  confirmPaymentAndSaveOrder,
  getUserTransactionHistory,
} = require("../controller/checkoutController");
const verifyToken = require("../middlewares/verifytoken");

router.post(
  "/checkout/single-artwork",

  createSingleArtworkCheckout,
);

router.post(
  "/checkout/confirm-payment",

  confirmPaymentAndSaveOrder,
);

router.get("/checkout/history/:userId", getUserTransactionHistory);

module.exports = router;
