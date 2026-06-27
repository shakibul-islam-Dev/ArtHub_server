const { ObjectId } = require("mongodb");

class Subscription {
  static format(data) {
    if (!data) throw new Error("No data provided for subscription formatting.");

    const priceId = data.priceId || data.price_id || data.planId;
    const userEmail =
      data.userEmail ||
      data.email ||
      (data.customer_details && data.customer_details.email);
    const userId =
      data.userId || data.user_id || data.customerId || data.customer;
    const status = data.status || data.subscriptionStatus;

    if (!priceId) throw new Error("Validation Failed: 'priceId' is required.");
    if (!userEmail)
      throw new Error("Validation Failed: 'userEmail' is required.");
    if (!userId) throw new Error("Validation Failed: 'userId' is required.");
    if (!status) throw new Error("Validation Failed: 'status' is required.");

    let formattedUserId = null;
    const cleanId = String(userId).trim();
    formattedUserId = ObjectId.isValid(cleanId)
      ? new ObjectId(cleanId)
      : cleanId;

    let formattedCreatedAt = new Date();
    if (data.createdAt) {
      formattedCreatedAt =
        typeof data.createdAt === "number" && data.createdAt < 10000000000
          ? new Date(data.createdAt * 1000)
          : new Date(data.createdAt);
    }

    return {
      userId: formattedUserId,
      userEmail: String(userEmail).trim().toLowerCase(),
      priceId: String(priceId).trim(),
      status: String(status).trim(),
      stripeSessionId:
        data.sessionId || data.stripeSessionId || data.id
          ? String(data.sessionId || data.stripeSessionId || data.id).trim()
          : null,
      planName: data.planName ? String(data.planName).trim() : "Plan",
      createdAt: formattedCreatedAt,
      updatedAt: new Date(),
    };
  }
}

module.exports = Subscription;
