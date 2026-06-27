const { ObjectId } = require("mongodb");

class Subscription {
  static format(data) {
    if (!data.priceId) throw new Error("Price ID is required.");
    if (!data.userEmail) throw new Error("User Email is required.");
    if (!data.userId) throw new Error("User ID is required.");
    if (!data.status) throw new Error("Subscription status is required.");

    let formattedUserId = null;
    if (data.userId) {
      const cleanId = data.userId.toString().trim();
      formattedUserId = ObjectId.isValid(cleanId)
        ? new ObjectId(cleanId)
        : cleanId;
    }

    return {
      userId: formattedUserId,
      userEmail: String(data.userEmail).trim().toLowerCase(),
      priceId: String(data.priceId).trim(),
      status: String(data.status).trim(),

      stripeSessionId: data.sessionId ? String(data.sessionId).trim() : null,
      planName: data.planName ? String(data.planName).trim() : "Plan",

      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: new Date(),
    };
  }
}

module.exports = Subscription;
