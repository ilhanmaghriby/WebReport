const express = require("express");
const router = express.Router();
const reportController = require("../controllers/report");
const { uploadAny } = require("../config/multer");

// 🔓 Route publik untuk data yang sudah diverifikasi
router.get("/verified", reportController.getVerifiedReports);

// 🔐 Route lainnya
router.get("/", reportController.getAllReports);
router.get("/user", reportController.getUserReports);
router.get("/:id", reportController.getReportById);
router.post("/", uploadAny, reportController.createReport);
router.put("/:id", uploadAny, reportController.updateReport);
router.put("/:id/verify", reportController.verifyReport);
router.delete("/:id", reportController.deleteReport);

module.exports = router;
