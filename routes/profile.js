const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const User = require("../models/user");

// GET /api/profile/me
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "name email picture streak longestStreak onboarding verseBookmarks chapterBookmarks notes calendarEntries"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;