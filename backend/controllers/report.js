const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const Report = require("../models/Report");
const slugify = require("slugify");

// Helper: hapus files
const deleteFiles = (filePaths) => {
  filePaths.forEach((filePath) => {
    const fullPath = path.join(__dirname, "../", filePath);
    try {
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (err) {
      console.error("Gagal menghapus file:", fullPath, err);
    }
  });
};

// Get all reports
exports.getAllReports = async (req, res) => {
  const reports = await Report.find().populate("userId", "username");
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

    // Process uploaded files for each prasarana item
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

    // Improved normalizePath function with type checking
    const normalizePath = (filePath) => {
      if (typeof filePath !== "string") {
        console.warn("Non-string file path:", filePath);
        return "";
      }
      return filePath.replace(/\\/g, "/").trim();
    };

    // Delete completely removed prasarana items
    const deletedItems = oldReport.prasaranaItems.filter(
      (oldItem) =>
        !parsedItems.some(
          (newItem) => newItem._id && newItem._id === oldItem._id.toString()
        )
    );

    // Safely get images to delete with null checks
    const imagesToDelete = deletedItems.flatMap((item) =>
      Array.isArray(item.images)
        ? item.images.map((img) => normalizePath(img)).filter(Boolean)
        : []
    );

    if (imagesToDelete.length > 0) {
      deleteFiles(imagesToDelete);
    }

    // Process each prasarana item
    for (const [idx, item] of parsedItems.entries()) {
      const safeLokasi = slugify(item.lokasi || `lokasi-${idx}`, {
        lower: true,
        strict: true,
      });

      if (!item._id) {
        // New item - process uploaded files
        item.images = files
          .filter(
            (file) =>
              file.fieldname &&
              file.fieldname.startsWith(`prasarana_${idx}_img_`)
          )
          .map((file, i) => {
            const ext = path.extname(file.originalname);
            const newFilename = `${safeLokasi}-${Date.now()}-${i + 1}${ext}`;
            const newPath = path.join("uploads", newFilename);
            fs.renameSync(file.path, newPath);
            return normalizePath(newPath);
          });
      } else {
        // Existing item - process image updates
        const existingItem = oldReport.prasaranaItems.find(
          (oldItem) => oldItem._id && oldItem._id.toString() === item._id
        );

        if (existingItem) {
          const oldImages = (existingItem.images || [])
            .map((img) => normalizePath(img))
            .filter(Boolean);

          const clientImages = (item.images || [])
            .map((img) => normalizePath(img))
            .filter(Boolean);

          const lokasiLama = existingItem.lokasi || "";
          const lokasiBaru = item.lokasi || "";

          // Identify images to remove (present in old but not in client)
          const removedImages = oldImages.filter(
            (img) => !clientImages.includes(img)
          );

          if (removedImages.length > 0) {
            deleteFiles(removedImages);
          }

          // Rename images if location changed
          let keptImages = [];
          if (lokasiLama !== lokasiBaru && oldImages.length > 0) {
            keptImages = oldImages
              .map((imgPath) => {
                try {
                  const ext = path.extname(imgPath);
                  const baseName = path.basename(imgPath, ext);
                  const newBaseName = baseName.replace(
                    slugify(lokasiLama, { lower: true, strict: true }),
                    slugify(lokasiBaru, { lower: true, strict: true })
                  );
                  const newImgPath = path.join(
                    path.dirname(imgPath),
                    newBaseName + ext
                  );

                  const oldFullPath = path.join(__dirname, "../", imgPath);
                  const newFullPath = path.join(__dirname, "../", newImgPath);

                  if (fs.existsSync(oldFullPath)) {
                    fs.renameSync(oldFullPath, newFullPath);
                    console.log(`[RENAME] ${oldFullPath} -> ${newFullPath}`);
                    return normalizePath(newImgPath);
                  }
                  return imgPath;
                } catch (err) {
                  console.error("Gagal rename gambar:", imgPath, err);
                  return imgPath;
                }
              })
              .filter(
                (img) => !removedImages.includes(normalizePath(img)) && img
              );
          } else {
            // Keep only images that weren't removed
            keptImages = oldImages.filter(
              (img) => !removedImages.includes(normalizePath(img))
            );
          }

          // Process new uploaded files
          const newImages = files
            .filter(
              (file) =>
                file.fieldname &&
                file.fieldname.startsWith(`prasarana_${idx}_img_`)
            )
            .map((file, i) => {
              try {
                const ext = path.extname(file.originalname);
                const newFilename = `${safeLokasi}-${Date.now()}-${
                  i + 1
                }${ext}`;
                const newPath = path.join("uploads", newFilename);
                fs.renameSync(file.path, newPath);
                return normalizePath(newPath);
              } catch (err) {
                console.error("Gagal memproses file baru:", err);
                return null;
              }
            })
            .filter(Boolean);

          // Combine kept and new images
          item.images = [
            ...keptImages.filter(Boolean),
            ...newImages.filter(Boolean),
          ];
        }
      }
    }

    // Update main report data
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
    res.status(500).json({
      message: "Gagal update report",
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
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

    // Delete all associated image files
    const allImages = report.prasaranaItems.flatMap(
      (item) => item.images || []
    );
    deleteFiles(allImages);

    // Delete report from database
    await Report.findByIdAndDelete(req.params.id);

    res.json({ message: "Report berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal menghapus report", error });
  }
};

// Get verified reports
exports.getVerifiedReports = async (req, res) => {
  try {
    const reports = await Report.find({ status: "done" }).populate(
      "userId",
      "username"
    );

    res.json(reports);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal mengambil report", error: err.message });
  }
};
