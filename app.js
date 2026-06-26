const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectDB } = require("./src/config/database");

const artworkRouter = require("./src/routes/artwork_route");
const userRouter = require("./src/routes/user_route");
const commentRouter = require("./src/routes/comment_route"); // 🎯 ১. কমেন্ট রাউটারটি ইম্পোর্ট করুন

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// ======================== মিডলওয়্যার ========================
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  }),
);

// ======================== API Routes ========================
app.use("/api/arthub/artwork", artworkRouter);
app.use("/api/arthub/user", userRouter);
app.use("/api/arthub/comment", commentRouter); // 🎯 ২. কমেন্ট এন্ডপয়েন্টটি সেট করুন

app.get("/", (req, res) => {
  res.send("Server is running!");
});

// ======================== Native MongoDB Connection ========================
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server is perfectly running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Critical: Could not start server due to DB error!", err);
  });
