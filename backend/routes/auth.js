const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const authMiddleware = require("../middleware/auth");

router.post("/login", authController.login);
router.get("/profile", authMiddleware, authController.profile);
router.post("/register", authController.register);

module.exports = router;
