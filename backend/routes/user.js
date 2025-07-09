const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");

router.get("/user", userController.getAllUsers);
router.put("/user/:id/password", userController.updatePassword);
router.put("/user/:id/role", userController.updateRole);
router.delete("/user/:id", userController.deleteUser);

module.exports = router;
