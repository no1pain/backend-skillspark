const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
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
