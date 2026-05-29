const router = require("express").Router();
const BlogPost = require("../models/BlogPost");

// GET all published posts
router.get("/", async (req, res) => {
  try {
    const posts = await BlogPost.find({ published: true })
      .select("title slug excerpt coverImage author tags createdAt")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single post by slug
router.get("/:slug", async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug, published: true });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;