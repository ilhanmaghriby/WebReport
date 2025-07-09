const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const authMiddleware = require("../middleware/auth");

// Semua route di bawah ini membutuhkan autentikasi
router.use(authMiddleware);

router.get("/", userController.getAllUsers);
router.put("/:id/password", userController.updatePassword);
router.put("/:id/role", userController.updateRole);
router.delete("/:id", userController.deleteUser);

module.exports = router;
