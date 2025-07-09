const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Note: In real application, use bcrypt to compare hashed passwords
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      "yokoso123",
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Login failed:", err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

exports.profile = async (req, res) => {
  try {
    // User info is attached to req by authMiddleware
    const user = req.user;

    // Get fresh data from database (optional)
    const userData = await User.findById(user.id, { password: 0 });

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(userData);
  } catch (err) {
    console.error("Failed to fetch profile:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch profile", error: err.message });
  }
};
