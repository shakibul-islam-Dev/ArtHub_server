const { ObjectId } = require("mongodb");

class Artwork {
  static format(data) {
    if (!data.title) throw new Error("Title is required.");
    if (!data.image_url) throw new Error("Image URL is required.");
    if (!data.description) throw new Error("Description is required.");
    if (
      data.price === undefined ||
      data.price === null ||
      isNaN(parseFloat(data.price))
    )
      throw new Error("Price is required and must be a valid number.");
    if (!data.category) throw new Error("Category is required.");

    let formattedArtistId = null;
    if (data.artist_id) {
      const cleanId = data.artist_id.toString().trim();
      formattedArtistId = ObjectId.isValid(cleanId)
        ? new ObjectId(cleanId)
        : cleanId;
    }

    return {
      artist_id: formattedArtistId,
      title: String(data.title).trim(),
      image_url: String(data.image_url).trim(),
      description: String(data.description).trim(),
      price: parseFloat(data.price),
      category: String(data.category).trim(),

      artist_name: data.artist_name
        ? String(data.artist_name).trim()
        : "Unknown Artist",
      artist_profile_url: data.artist_profile_url
        ? String(data.artist_profile_url).trim()
        : "",
      isSold: typeof data.isSold === "boolean" ? data.isSold : false,
      date_uploaded: data.date_uploaded
        ? new Date(data.date_uploaded)
        : new Date(),
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: new Date(),
    };
  }
}

module.exports = Artwork;
