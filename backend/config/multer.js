const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Pastikan folder uploads/ ada
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Bersihkan nama file untuk menghindari karakter aneh
    const safeName = file.originalname.replace(/\s+/g, "-").toLowerCase();
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpeg, .jpg, and .png files are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

/**
 * Middleware untuk menerima semua file (tanpa mendefinisikan nama field secara eksplisit)
 */
const uploadAny = upload.any(); // menerima semua file di form

module.exports = {
  upload,
  uploadAny, // bisa digunakan di route seperti: `router.post("/report", uploadAny, controllerFunction)`
};
