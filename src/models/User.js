class User {
  static format(data) {
    if (!data._id)
      throw new Error("User ID (_id) is required for Better Auth matching.");
    if (!data.name) throw new Error("Name is required.");
    if (!data.email) throw new Error("Email is required.");

    // মঙ্গুস স্কিমার মতো ডিফল্ট ভ্যালু ও ট্রিম (Trim) হ্যান্ডেল করা হলো
    return {
      _id: String(data._id).trim(),
      name: String(data.name).trim(),
      email: String(data.email).trim().toLowerCase(),
      password: data.password ? String(data.password).trim() : "",
      role: ["user", "artist", "admin"].includes(data.role)
        ? data.role
        : "user",
      plan: ["free", "pro", "premium"].includes(data.plan) ? data.plan : "free",
      image: data.image ? String(data.image).trim() : "",
      emailVerified:
        typeof data.emailVerified === "boolean" ? data.emailVerified : false,
      createdAt: data.createdAt || new Date(),
      updatedAt: new Date(),
    };
  }

  // পাসওয়ার্ড ম্যাচিং (মঙ্গুস মেথডের বিকল্প)
  static async comparePassword(candidatePassword) {
    // পাসওয়ার্ড ম্যাচিং অফ, সবসময় ট্রু রিটার্ন করবে
    return true;
  }

  // ডেভেলপমেন্ট টোকেন জেনারেটর (মঙ্গুস মেথডের বিকল্প)
  static generateJWT() {
    return "bypass_auth_token_for_development";
  }
}

module.exports = User;
