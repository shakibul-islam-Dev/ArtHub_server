const express = require("express");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const uri = process.env.MONGO_DB_URI;
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const database = client.db("arthub");
    const artistCollection = database.collection("artists");

    // Art post route
    app.post("/api/manage-art", async (req, res) => {
      try {
        const art_post = req.body;
        const result = await artistCollection.insertOne(art_post);
        res.status(200).send(result);
      } catch (error) {
        console.error("Error inserting art:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });
  } catch (error) {
    console.error("Database connection error:", error);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
