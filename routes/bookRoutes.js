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

router.route("/").get(getAllBooks).post(addBook);

router.route("/:id").get(getBookById).put(updateBook).delete(deleteBook);

router.get("/category/:category", getBooksByCategory);

router.get("/public", getPublicBooks);

router.post("/", uploadPdf, uploadImage, async (req, res) => {
  try {
    const { title, description } = req.body;

    const bookData = {
      title,
      description,
      fileUrl: req.files.pdf.path, // PDF file URL
    };

    // Add image URL if an image was uploaded
    if (req.files && req.files.image) {
      bookData.imageUrl = req.files.image.path;
    }

    const book = new Book(bookData);
    await book.save();

    res.status(201).json({ success: true, data: book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

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
