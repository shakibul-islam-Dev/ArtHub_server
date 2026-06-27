const express = require("express");
const router = express.Router();

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
