const mongoose = require("mongoose");

const blogPostSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  slug:      { type: String, required: true, unique: true },
  content:   { type: String, required: true },
  excerpt:   { type: String, default: "" },
  coverImage:{ type: String, default: "" },
  author:    { type: String, default: "Admin" },
  published: { type: Boolean, default: false },
  tags:      { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model("BlogPost", blogPostSchema);