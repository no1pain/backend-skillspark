const express = require("express");
const router = express.Router();
const {
  getAllBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
  getBooksByCategory,
  getPublicBooks,
} = require("../controllers/bookController");
const Book = require("../models/Book");
const { uploadPdf, uploadImage } = require("../config/cloudinary");

router.route("/").get(getAllBooks);

router.post("/", uploadPdf, uploadImage, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      subcategory,
      price,
      pages,
      author,
      difficulty,
      isPublic,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "PDF file is required",
      });
    }

    const bookData = {
      title,
      description,
      category,
      subcategory,
      price,
      pages,
      author,
      difficulty,
      isPublic,
      fileUrl: req.file.path,
    };

    const book = new Book(bookData);
    await book.save();

    res.status(201).json({ success: true, data: book });
  } catch (error) {
    console.error("Error adding book:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

router.route("/:id").get(getBookById).put(updateBook).delete(deleteBook);
router.route("/category/:category").get(getBooksByCategory);
router.route("/public").get(getPublicBooks);

// Update book image
router.patch("/:id/image", uploadImage, async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No image provided" });
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { imageUrl: req.file.path },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ success: false, error: "Book not found" });
    }

    res.json({ success: true, data: book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

module.exports = router;
