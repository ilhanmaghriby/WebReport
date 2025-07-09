const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const Report = require("../models/Report");
const slugify = require("slugify");

// Get all reports
exports.getAllReports = async (req, res) => {
  const reports = await Report.find().populate("userId", "name email");
  res.json(reports);
};

// Get user reports
exports.getUserReports = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token diperlukan" });

  try {
    const decoded = jwt.verify(token, "yokoso123");
    const userId = decoded.id;

    const reports = await Report.find({ userId });
    res.json(reports);
  } catch (err) {
    res.status(401).json({ message: "Token tidak valid" });
  }
};

// Get report by ID
exports.getReportById = async (req, res) => {
  const reportId = req.params.id;
  const report = await Report.findById(reportId);
  if (!report) {
    return res.status(404).json({ message: "Data tidak ditemukan" });
  }
  res.json(report);
};
// Create report
exports.createReport = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token diperlukan" });

  try {
    const decoded = jwt.verify(token, "yokoso123");
    const userId = decoded.id;

    const { title, sektor, subsektor, sarana, prasaranaItems, keterangan } =
      req.body;
    if (!title || !sektor || !subsektor) {
      return res.status(400).json({ message: "Field tidak lengkap" });
    }

    const parsedItems = prasaranaItems ? JSON.parse(prasaranaItems) : [];
    const files = req.files || [];

    parsedItems.forEach((item, idx) => {
      const safeLokasi = slugify(item.lokasi || `lokasi-${idx}`, {
        lower: true,
        strict: true,
      });
      item.images = files
        .filter((file) => file.fieldname.startsWith(`prasarana_${idx}_img_`))
        .map((file, i) => {
          const ext = path.extname(file.originalname);
          const newFilename = `${safeLokasi}-${Date.now()}-${i + 1}${ext}`;
          const newPath = path.join("uploads", newFilename);
          fs.renameSync(file.path, newPath);
          return newPath;
        });
    });

    const report = new Report({
      title,
      sektor,
      subsektor,
      sarana,
      prasaranaItems: parsedItems,
      keterangan,
      userId,
      status: "in_progress",
    });

    await report.save();
    res.status(201).json({ message: "Berhasil disimpan", report });
  } catch (err) {
    console.error("❌ Error saat simpan report:", err);
    res
      .status(500)
      .json({ message: "Gagal menyimpan data", error: err.message });
  }
};
// Update report
exports.updateReport = async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token diperlukan" });

  try {
    const decoded = jwt.verify(token, "yokoso123");
    const { title, sektor, subsektor, sarana, prasaranaItems, keterangan } =
      req.body;

    const parsedItems = prasaranaItems ? JSON.parse(prasaranaItems) : [];
    const files = req.files || [];

    const oldReport = await Report.findById(id);
    if (!oldReport) {
      return res.status(404).json({ message: "Report tidak ditemukan" });
    }

    oldReport.prasaranaItems.forEach((item) => {
      item.images?.forEach((imgPath) => {
        const fullPath = path.join(__dirname, "../", imgPath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      });
    });

    parsedItems.forEach((item, idx) => {
      const safeLokasi = slugify(item.lokasi || `lokasi-${idx}`, {
        lower: true,
        strict: true,
      });
      item.images = files
        .filter((file) => file.fieldname.startsWith(`prasarana_${idx}_img_`))
        .map((file, i) => {
          const ext = path.extname(file.originalname);
          const newFilename = `${safeLokasi}-${Date.now()}-${i + 1}${ext}`;
          const newPath = path.join("uploads", newFilename);
          fs.renameSync(file.path, newPath);
          return newPath;
        });
    });

    oldReport.title = title;
    oldReport.sektor = sektor;
    oldReport.subsektor = subsektor;
    oldReport.sarana = sarana;
    oldReport.keterangan = keterangan;
    oldReport.prasaranaItems = parsedItems;
    oldReport.status = "in_progress";

    await oldReport.save();
    res.json({ message: "Report berhasil diperbarui", report: oldReport });
  } catch (err) {
    console.error("Error saat update report:", err);
    res
      .status(500)
      .json({ message: "Gagal update report", error: err.message });
  }
};

// Verify report
exports.verifyReport = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = ["done", "in_progress", "perbaikan", "ditolak"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Status tidak valid" });
  }

  try {
    const report = await Report.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("userId", "name email");

    if (!report) {
      return res.status(404).json({ message: "Report tidak ditemukan" });
    }

    res.json(report);
  } catch (err) {
    console.error("Gagal update status:", err);
    res.status(500).json({ message: "Update gagal", error: err.message });
  }
};

// Delete report
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report tidak ditemukan" });
    }

    // Delete associated image files
    if (report.image && report.image.length > 0) {
      for (const imagePath of report.image) {
        const fullPath = path.join(__dirname, "../", imagePath);
        try {
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        } catch (err) {
          console.error("Gagal menghapus file gambar:", fullPath, err);
        }
      }
    }

    // Delete report from database
    await Report.findByIdAndDelete(req.params.id);

    res.json({ message: "Report berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal menghapus report", error });
  }
};
