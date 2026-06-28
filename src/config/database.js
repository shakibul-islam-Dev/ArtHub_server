const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

const uri = process.env.MONGO_DB_URI;

const client = new MongoClient(uri, {
  maxPoolSize: 10,
});

let db = null;
let connectionPromise = null;

const connectDB = async () => {
  try {
    if (db) return db;

    if (!connectionPromise) {
      connectionPromise = client.connect().then(() => {
        db = client.db("arthub");
        console.log("Connected to MongoDB via Native Driver!");
        return db;
      });
    }

    return await connectionPromise;
  } catch (error) {
    console.error("Database connection error:", error);
    connectionPromise = null;
  }
};

const getCollection = async (collectionName) => {
  const database = await connectDB();
  return database.collection(collectionName);
};

module.exports = { connectDB, getCollection };
