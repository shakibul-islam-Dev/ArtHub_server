require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./src/config/database");

// Routes Import
const artworkRouter = require("./src/routes/artwork_route");
const userRouter = require("./src/routes/user_route");
const commentRouter = require("./src/routes/comment_route");
const subscription_route = require("./src/routes/subscription_route");
const checkoutRouter = require("./src/routes/checkoutRoutes");
const salesRoutes = require("./src/routes/sales_route");
const transctionsRoute = require("./src/routes/transctions_route");

const app = express();

// ======================== ১. গ্লোবাল মিডলওয়্যার ========================
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection failed during request:", err);
    res
      .status(500)
      .json({ error: "Internal Server Error: Database connection failed" });
  }
});

// ======================== ২. API Routes ========================
app.use("/api/arthub/artwork", artworkRouter);
app.use("/api/arthub/user", userRouter);
app.use("/api/arthub/comment", commentRouter);
app.use("/api/arthub/subscriptions", subscription_route);
app.use("/api/arthub", checkoutRouter);
app.use("/api/arthub", salesRoutes);
app.use("/api/arthub/transactions", transctionsRoute);

app.get("/", (req, res) => {
  res.send("Server is running perfectly!");
});

if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server is perfectly running on port ${port}`);
  });
}

module.exports = app;
