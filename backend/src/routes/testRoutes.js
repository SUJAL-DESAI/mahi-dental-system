const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/private", protect, (req, res) => {
  res.json({ message: "You are logged in", user: req.user });
});

router.get("/admin", protect, adminOnly, (req, res) => {
  res.json({ message: "Admin access granted" });
});

module.exports = router;
