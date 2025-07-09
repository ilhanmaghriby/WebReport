const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const connectDB = require("./config/db");
require("dotenv").config();

// Import routes dan middleware
const authRoutes = require("./routes/auth");
const reportRoutes = require("./routes/report");
const userRoutes = require("./routes/user");
const authMiddleware = require("./middleware/auth"); // Perhatikan path ini

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database connection
connectDB();

// Routes
app.use("/auth", authRoutes);
app.use("/report", authMiddleware, reportRoutes); // Proteksi route report
app.use("/users", authMiddleware, userRoutes); // Proteksi route users

// Error Handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "Ukuran file maksimal 5 MB" });
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ message: "Otentikasi gagal" });
  }

  if (typeof err === "string") {
    return res.status(400).json({ message: err });
  }

  console.error("❌ Error:", err);
  res.status(500).json({ message: "Terjadi kesalahan server" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
