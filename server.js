const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

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

// Initialize the Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Endpoint to receive data, rewrite title and body using AI, and add it to the post collection
app.post("/store_data", async (req, res) => {
  try {
    const postData = req.body;

    // Generate a new ObjectId
    const postId = new mongoose.Types.ObjectId();

    // AI to rewrite title
    const titlePrompt = "rewrite this blog post title: " + postData.title;
    const titleModel = genAI.getGenerativeModel({ model: "gemini-pro" });
    const titleResult = await titleModel.generateContent(titlePrompt);
    const titleResponse = await titleResult.response;
    const rewrittenTitle = await titleResponse.text();

    // AI to rewrite body
    const bodyPrompt = "rewrite this blog post body:" + postData.body;
    const bodyModel = genAI.getGenerativeModel({ model: "gemini-pro" });
    const bodyResult = await bodyModel.generateContent(bodyPrompt);
    const bodyResponse = await bodyResult.response;
    const rewrittenBody = await bodyResponse.text();

    // Modify the data to include the desired fields
    const modifiedData = {
      _id: postId,
      author: "chrome-extension",
      title: rewrittenTitle,
      body: rewrittenBody,
      imageUrl: postData.imageUrl,
      published: false,
      tags: [],
      type: "PREP",
      category: ["658ee65ddf60336274053be7", "658ee4c0a98b224d178fe5f2"],
      createdAt: postData.createdAt,
      slug: postData.slug,
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
