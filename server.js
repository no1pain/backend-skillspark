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
      "https://skillspark.vercel.app",
      "https://skill-spark-bay.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Origin",
      "Accept",
      "X-Requested-With",
      "Access-Control-Allow-Origin",
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
