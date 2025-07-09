const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.password !== password)
    return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id, role: user.role }, "yokoso123", {
    expiresIn: "1d",
  });

  res.status(200).json({ message: "Login successful", token });
};

// Profile
exports.profile = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, "yokoso123");
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
