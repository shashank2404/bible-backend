const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const crypto = require("crypto");
// Login — works for users already registered in the Android app
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Google OAuth users have no password
    if (!user.password)
      return res.status(400).json({ message: "Please use Google login" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Wrong password" });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, name: user.name, picture: user.picture });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
//forgot password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No account with that email" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    // TODO: send email with reset link using nodemailer
    res.json({ message: `Reset link sent to ${email}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;