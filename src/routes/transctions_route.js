const express = require("express");
const transctionsRoute = express.Router();
const {
  createTransaction,
  getAllTransactions,
} = require("../controller/transtionsController");

transctionsRoute.route("/").get(getAllTransactions).post(createTransaction);

module.exports = transctionsRoute;
