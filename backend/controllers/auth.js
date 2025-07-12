const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || "yokoso123";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

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

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login failed:", err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

exports.profile = async (req, res) => {
  try {
    // Get fresh data from database
    const userData = await User.findById(req.user.id, { password: 0 });

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

// Register new user (for admin to add users)
exports.register = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res
      .status(400)
      .json({ message: "Username, password and role are required" });
  }

  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    // Return user data without password
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (err) {
    console.error("Registration failed:", err);
    res
      .status(500)
      .json({ message: "Registration failed", error: err.message });
  }
};
