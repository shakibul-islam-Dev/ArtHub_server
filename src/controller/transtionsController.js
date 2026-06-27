const Transaction = require("../models/Transaction");
const { getCollection } = require("../config/database");

const createTransaction = async (req, res) => {
  try {
    const formattedData = Transaction.format(req.body);

    const transactionsCollection = await getCollection("transactions");
    const result = await transactionsCollection.insertOne(formattedData);

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: {
        _id: result.insertedId,
        ...formattedData,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const transactionsCollection = await getCollection("transactions");
    const transactions = await transactionsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createTransaction,
  getAllTransactions,
};
