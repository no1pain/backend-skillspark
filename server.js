const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5174;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://skillspark-frontend.vercel.app",
      "https://skillspark.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Origin",
      "Accept",
      "X-Requested-With",
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json());

const courseRoutes = require("./routes/courseRoutes");
const bookRoutes = require("./routes/bookRoutes");

app.use("/api/courses", courseRoutes);
app.use("/api/books", bookRoutes);

mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "skillspark",
  })
  .then(() => {
    console.log("Connected to MongoDB - Database: skillspark");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
