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

router.route("/").get(getAllBooks).post(addBook);

router.route("/:id").get(getBookById).put(updateBook).delete(deleteBook);

router.get("/category/:category", getBooksByCategory);

router.get("/public", getPublicBooks);

module.exports = router;
