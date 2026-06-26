const express = require("express");
const router = express.Router();

const { getSalesReport } = require("../controllers/salesController");

router.get("/sales-report", getSalesReport);

module.exports = router;
