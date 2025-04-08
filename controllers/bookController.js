const Book = require("../models/Book");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        error: "Book not found",
      });
    }

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid book ID format",
      });
    }
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

exports.addBook = async (req, res) => {
  upload.single("bookContent")(req, res, async (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({
        success: false,
        error: err.message || "Error processing form data",
      });
    }

    try {
      console.log("=== Received Data ===");
      console.log("Body:", req.body);
      console.log("File:", req.file);

      const bookData = {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        subcategory: req.body.subcategory,
        contentType: req.body.contentType,
        price: parseFloat(req.body.price),
        pages: parseInt(req.body.pages),
        author: req.body.author,
        difficulty: req.body.difficulty,
        isPublic: req.body.isPublic === "true",
        fileUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
        fileFormat: req.body.fileFormat,
      };

      console.log("=== Processed Data ===");
      console.log("Book data to save:", bookData);

      const book = await Book.create(bookData);

      console.log("=== Saved Data ===");
      console.log("Saved book:", book);

      res.status(201).json({
        success: true,
        data: book,
      });
    } catch (error) {
      console.error("=== Error Details ===");
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Full error:", error);

      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((val) => val.message);
        return res.status(400).json({
          success: false,
          error: messages,
        });
      } else {
        res.status(500).json({
          success: false,
          error: "Server Error",
        });
      }
    }
  });
};

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: "Book not found",
      });
    }

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages,
      });
    } else if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid book ID format",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Server Error",
      });
    }
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        error: "Book not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid book ID format",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Server Error",
      });
    }
  }
};

exports.getBooksByCategory = async (req, res) => {
  try {
    const books = await Book.find({ category: req.params.category });

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

exports.getPublicBooks = async (req, res) => {
  try {
    const books = await Book.find({ isPublic: true });

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
