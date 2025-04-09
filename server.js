const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5174;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, PUT, POST, DELETE, OPTIONS, PATCH"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept, Origin"
    );
    return res.status(200).json({});
  }
  next();
});

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
