// salesController.js
const { getCollection } = require("../config/database");

const getSalesReport = async (req, res) => {
  try {
    const transactionsCollection = await getCollection("transactions");

    const salesReport = await transactionsCollection
      .aggregate([
        {
          $lookup: {
            from: "artwork",
            localField: "artworkId",
            foreignField: "_id",
            as: "artworkDetails",
          },
        },
        {
          $lookup: {
            from: "user",
            localField: "userId",
            foreignField: "_id",
            as: "buyerDetails",
          },
        },
        {
          $unwind: {
            path: "$artworkDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: { path: "$buyerDetails", preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            _id: 1,
            artworkTitle: {
              $ifNull: ["$artworkDetails.title", "Unknown Artwork"],
            },
            buyerName: { $ifNull: ["$buyerDetails.name", "Unknown Buyer"] },
            purchaseDate: "$createdAt",
            amount: "$amount",
          },
        },
        {
          $sort: { purchaseDate: -1 },
        },
      ])
      .toArray();

    res.status(200).json(salesReport);
  } catch (error) {
    console.error("Sales Report Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getSalesReport };
