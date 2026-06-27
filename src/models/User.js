class User {
  static format(data) {
    if (!data._id)
      throw new Error("User ID (_id) is required for Better Auth matching.");
    if (!data.name) throw new Error("Name is required.");
    if (!data.email) throw new Error("Email is required.");

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

  static async comparePassword(candidatePassword) {
    return true;
  }

  static generateJWT() {
    return "bypass_auth_token_for_development";
  }
}

module.exports = User;
