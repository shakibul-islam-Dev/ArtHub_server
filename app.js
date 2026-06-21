const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const databaseRoute = require("./src/config/database");

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// মিডলওয়্যার
app.use(express.json());
app.use(cors());

// রাউটস
app.use("/api/database", databaseRoute);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

// সার্ভার লিসেন
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
