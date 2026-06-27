const express = require("express");
const router = express.Router();

const { getSalesReport } = require("../controller/salesController");

router.get("/sales-report", getSalesReport);

module.exports = router;
