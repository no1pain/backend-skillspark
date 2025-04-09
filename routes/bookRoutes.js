const express = require("express");
const router = express.Router();
const {
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  getBooksByCategory,
  getPublicBooks,
} = require("../controllers/bookController");
const Book = require("../models/Book");
const multer = require("multer");
const { cloudinary } = require("../config/cloudinary");

// Basic routes
router.route("/").get(getAllBooks);
router.route("/:id").get(getBookById).put(updateBook).delete(deleteBook);
router.route("/category/:category").get(getBooksByCategory);
router.route("/public").get(getPublicBooks);

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Add a new book with PDF and optional image
router.post(
  "/",
  upload.fields([
    { name: "pdf", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      console.log("Received request body:", req.body);
      console.log("Received files:", req.files);

      // Check if PDF is provided
      if (!req.files || !req.files.pdf) {
        return res.status(400).json({
          success: false,
          error: "PDF file is required",
        });
      }

      // Parse the book data
      let bookData;
      try {
        console.log("Parsing bookData from:", req.body.bookData);
        bookData = JSON.parse(req.body.bookData);
        console.log("Parsed bookData:", bookData);
      } catch (error) {
        console.error("Error parsing book data:", error);
        return res.status(400).json({
          success: false,
          error: "Invalid book data format",
        });
      }

      const pdfFile = req.files.pdf[0];
      const imageFile = req.files.image ? req.files.image[0] : null;

      try {
        // Upload PDF to Cloudinary
        const pdfUploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "skillspark_books",
              resource_type: "raw",
              format: "pdf",
            },
            (error, result) => {
              if (error) {
                console.error("Error uploading PDF:", error);
                reject(error);
              } else {
                console.log("PDF upload result:", result);
                resolve(result);
              }
            }
          );
          stream.end(pdfFile.buffer);
        });

        // Update book data with PDF URL
        bookData.fileUrl = pdfUploadResult.secure_url;
        bookData.fileFormat = "PDF";

        // If image was provided, upload it
        if (imageFile) {
          const imageUploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: "skillspark_images",
                transformation: [{ width: 500, crop: "limit" }],
              },
              (error, result) => {
                if (error) {
                  console.error("Error uploading image:", error);
                  reject(error);
                } else {
                  console.log("Image upload result:", result);
                  resolve(result);
                }
              }
            );
            stream.end(imageFile.buffer);
          });
          bookData.imageUrl = imageUploadResult.secure_url;
        }

        console.log("Final bookData before save:", bookData);

        // Create and save the book with all data
        const book = new Book(bookData);
        const savedBook = await book.save();
        console.log("Saved book:", savedBook);

        res.status(201).json({
          success: true,
          data: savedBook,
          message: imageFile
            ? "Book created with PDF and image"
            : "Book created with PDF only",
        });
      } catch (uploadError) {
        console.error("Error uploading to Cloudinary:", uploadError);
        return res.status(500).json({
          success: false,
          error: "Error uploading files to cloud storage",
        });
      }
    } catch (error) {
      console.error("Error processing request:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error processing request",
      });
    }
  }
);

// Update book image
router.patch("/:id/image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No image provided",
      });
    }

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        success: false,
        error: "Invalid file type. Only image files are allowed.",
      });
    }

    try {
      const imageUploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "skillspark_images",
            transformation: [{ width: 500, crop: "limit" }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      const book = await Book.findByIdAndUpdate(
        req.params.id,
        { imageUrl: imageUploadResult.secure_url },
        { new: true }
      );

      if (!book) {
        return res.status(404).json({
          success: false,
          error: "Book not found",
        });
      }

      res.json({
        success: true,
        data: book,
      });
    } catch (uploadError) {
      console.error("Error uploading to Cloudinary:", uploadError);
      return res.status(500).json({
        success: false,
        error: "Error uploading image to cloud storage",
      });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
});

module.exports = router;
