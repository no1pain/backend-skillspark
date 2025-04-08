const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const pdfStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "skillspark_books",
    format: async (req, file) => "pdf",
    public_id: (req, file) => `book-${Date.now()}`,
  },
});

const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "skillspark_images",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [{ width: 500, crop: "limit" }],
    public_id: (req, file) => `img-${Date.now()}`,
  },
});

const uploadPdf = multer({
  storage: pdfStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Not a PDF file"), false);
    }
  },
});

const uploadImage = multer({
  storage: imageStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image file"), false);
    }
  },
});

module.exports = {
  uploadPdf: uploadPdf.single("pdf"),
  uploadImage: uploadImage.single("image"),
};
