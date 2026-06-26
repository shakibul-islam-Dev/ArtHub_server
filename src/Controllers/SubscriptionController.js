const { getCollection } = require("../config/database");
const Subscription = require("../models/Subscription");

const subscriptionController = {
  // ১. সাবস্ক্রিপশন তৈরি বা আপডেট করা (Upsert)
  upsertSubscription: async (req, res) => {
    try {
      const rawData = req.body;

      // মডেল ভ্যালিডেশন এবং ফরম্যাটিং
      const formattedData = Subscription.format(rawData);

      // ⚠️ ফিক্সড: এখানে অবশ্যই await দিতে হবে
      const subscriptionCollection = await getCollection("subscriptions");

      // যদি এই ইউজারের সাবস্ক্রিপশন আগে থেকেই থাকে তবে আপডেট হবে, না থাকলে নতুন তৈরি হবে (Upsert)
      await subscriptionCollection.updateOne(
        { userEmail: formattedData.userEmail },
        {
          $set: {
            ...formattedData,
            updatedAt: new Date(),
          },
        },
        { upsert: true },
      );

      return res.status(200).json({
        success: true,
        message: "Subscription synced successfully!",
        data: formattedData,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to sync subscription.",
      });
    }
  },

  // ২. নির্দিষ্ট ইউজারের সাবস্ক্রিপশন খুঁজে বের করা (Get by User Email)
  getSubscriptionByUser: async (req, res) => {
    try {
      const { email } = req.params;

      if (!email) {
        return res
          .status(400)
          .json({ success: false, message: "Email is required." });
      }

      // ⚠️ ফিক্সড: এখানে অবশ্যই await দিতে হবে
      const subscriptionCollection = await getCollection("subscriptions");

      const subscription = await subscriptionCollection.findOne({
        userEmail: email.trim().toLowerCase(),
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: "No subscription found for this user.",
        });
      }

      return res.status(200).json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error occurred while fetching subscription.",
      });
    }
  },

  // ৩. সাবস্ক্রিপশন স্ট্যাটাস আপডেট করা (Update Status)
  updateSubscriptionStatus: async (req, res) => {
    try {
      const { priceId, userEmail, status } = req.body;

      if (!priceId || !userEmail || !status) {
        return res.status(400).json({
          success: false,
          message: "priceId, userEmail, and status are required for update.",
        });
      }

      // ⚠️ ফিক্সড: এখানে অবশ্যই await দিতে হবে
      const subscriptionCollection = await getCollection("subscriptions");

      const result = await subscriptionCollection.updateOne(
        {
          priceId: priceId.trim(),
          userEmail: userEmail.trim().toLowerCase(),
        },
        {
          $set: {
            status: status.trim(),
            updatedAt: new Date(),
          },
        },
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Subscription record not found to update.",
        });
      }

      return res.status(200).json({
        success: true,
        message: `Subscription status updated to '${status}' successfully.`,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error occurred while updating subscription.",
      });
    }
  },
};

module.exports = subscriptionController;
