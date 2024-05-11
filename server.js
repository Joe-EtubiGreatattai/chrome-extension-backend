const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 7700;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("Error connecting to MongoDB:", err));

// Define a schema for the post collection
const postSchema = new mongoose.Schema({
  author: String,
  title: String,
  body: String,
  imageUrl: String,
  published: Boolean,
  tags: [String],
  type: String,
  category: [String],
  createdAt: Date,
  slug: String,
  __v: Number,
});

// Create a model for the post collection
const Post = mongoose.model("Post", postSchema);

// Middleware to parse JSON bodies
app.use(express.json());

// Endpoint to receive data and add it to the post collection
app.post("/store_data", async (req, res) => {
  try {
    const postData = req.body;

    // Modify the data to include the desired fields
    const modifiedData = {
      _id: new mongoose.Types.ObjectId(), // Generate a new ObjectId
      author: "chrome-extension",
      title: postData.title,
      body: postData.body,
      imageUrl: postData.imageUrl,
      published: false,
      tags: [],
      type: "PREP",
      category: ["658ee65ddf60336274053be7", "658ee4c0a98b224d178fe5f2"],
      createdAt: postData.createdAt,
      slug: postData.slug, // Use the slug from the incoming data
      __v: 0,
    };

    // Insert data into the post collection
    const result = await Post.create(modifiedData);
    res.status(201).json({ message: "Data added successfully", result });
  } catch (err) {
    console.error("Error storing data:", err);
    res.status(500).json({ error: "An error occurred while storing data" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
