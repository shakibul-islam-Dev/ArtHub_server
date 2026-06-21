const express = require("express");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();
const database = express.Router();

const uri = process.env.MONGO_DB_URI;
const client = new MongoClient(uri);

let artistCollection;

// ডেটাবেজ কানেক্ট করার ফাংশন
async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const db = client.db("arthub");
    artistCollection = db.collection("artists");
  } catch (error) {
    console.error("Database connection error:", error);
  }
}
connectDB();

// আর্ট পোস্ট রাউট (এখন এটি /api/database/manage-art হিসেবে কাজ করবে)
database.post("/manage-art", async (req, res) => {
  try {
    if (!artistCollection) {
      return res.status(500).send({ message: "Database not initialized" });
    }
    const art_post = req.body;
    const result = await artistCollection.insertOne(art_post);
    res.status(200).send(result);
  } catch (error) {
    console.error("Error inserting art:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// আপনার আগের বার্ডস রাউটগুলোও এখানে রাখতে পারেন
database.get("/", (req, res) => {
  res.send("Birds home page");
});

database.get("/about", (req, res) => {
  res.send("About birds");
});

module.exports = database;
