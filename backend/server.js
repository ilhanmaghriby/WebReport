const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const connectDB = require("./config/db");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const reportRoutes = require("./routes/report");
const userRoutes = require("./routes/user");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database connection
connectDB();

// Routes
app.use(authRoutes);
app.use("/report", reportRoutes);
app.use(userRoutes);

// Error Handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "Ukuran file maksimal 5 MB" });
  }

  if (typeof err === "string") {
    return res.status(400).json({ message: err });
  }

  console.error("❌ Unexpected error:", err);
  res.status(500).json({ message: "Terjadi kesalahan pada server" });
});

// Start Server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
