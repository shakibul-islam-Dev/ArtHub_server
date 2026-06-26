const express = require("express");
const router = express.Router();
// পাথটি আপনার প্রজেক্ট অনুযায়ী ঠিক আছে কিনা নিশ্চিত হোন
const subscriptionController = require("../controllers/subscriptionController");

router.post("/subscriptions", subscriptionController.upsertSubscription);

router.get(
  "/subscriptions/:email",
  subscriptionController.getSubscriptionByUser,
);

router.patch(
  "/subscriptions/update-status",
  subscriptionController.updateSubscriptionStatus,
);

module.exports = router;
