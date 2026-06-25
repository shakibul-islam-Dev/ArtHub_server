const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
// const cookieParser = require("cookie-parser");
const { connectDB } = require("./src/config/database"); // 🎯 আমাদের তৈরি করা র-মঙ্গোডিবি ড্রাইভার ফাইলটি ইম্পোর্ট করো

const artworkRouter = require("./src/routes/artwork_route");
const userRouter = require("./src/routes/user_route");

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
// app.use(cookieParser());

// ======================== API Routes ========================
app.use("/api/arthub/artwork", artworkRouter);
app.use("/api/arthub/user", userRouter);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

// ======================== Native MongoDB Connection ========================
// 🎯 মঙ্গুসের পরিবর্তে র-মঙ্গোডিবি ড্রাইভার দিয়ে কানেক্ট করে সার্ভার স্টার্ট করা হচ্ছে
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server is perfectly running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Critical: Could not start server due to DB error!", err);
  });
