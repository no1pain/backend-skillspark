const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Description is required"],
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    trim: true,
  },
  subcategory: {
    type: String,
    trim: true,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  contentType: {
    type: String,
    enum: ["Book", "Course"],
    required: [true, "Content type is required"],
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: 0,
  },
  pages: {
    type: Number,
    required: [true, "Number of pages is required"],
    min: 1,
  },
  author: {
    type: String,
    required: [true, "Author name is required"],
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    default: "Beginner",
  },
  fileUrl: {
    type: String,
    required: [true, "Book file is required"],
  },
  fileFormat: {
    type: String,
    enum: ["PDF", "EPUB", "MOBI"],
    required: [true, "File format is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Book", bookSchema);
