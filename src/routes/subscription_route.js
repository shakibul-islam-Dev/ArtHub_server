const express = require("express");
const router = express.Router();

const subscriptionController = require("../controller/subscriptionController");

router.post("/", subscriptionController.upsertSubscription);

router.get("/:email", subscriptionController.getSubscriptionByUser);

router.patch("/update-status", subscriptionController.updateSubscriptionStatus);

module.exports = router;
