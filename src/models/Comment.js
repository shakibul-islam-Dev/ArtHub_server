class Comment {
  static format(data) {
    if (!data.artworkId) {
      throw new Error(
        "Artwork ID (artworkId) is required for Comment matching.",
      );
    }
    if (!data.userId) {
      throw new Error("User ID (userId) is required for Comment matching.");
    }
    if (!data.comment || String(data.comment).trim() === "") {
      throw new Error("Comment text is required.");
    }

    return {
      artworkId:
        typeof data.artworkId === "object"
          ? data.artworkId
          : String(data.artworkId).trim(),
      userId:
        typeof data.userId === "object"
          ? data.userId
          : String(data.userId).trim(),
      comment: String(data.comment).trim(),
      createdAt: data.createdAt || new Date(),
      updatedAt: new Date(),
    };
  }

  static isValidComment(text) {
    return text && text.trim().length > 0;
  }
}

module.exports = Comment;
