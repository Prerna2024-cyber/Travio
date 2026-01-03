const express = require("express");
const login = require("../controllers/login");
const createUser = require("../controllers/signup");
const authmiddleware = require("../middleware/authmiddleware");
const User = require("../models/User"); 

const router = express.Router();

router.post("/signup", createUser);
router.post("/login", login);

// ✅ Logout route
router.post("/logout", (req, res) => {
  res.clearCookie("token", { // match your cookie name
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });
  res.json({ success: true, message: "Logged out successfully" });
});

// Get logged-in user info
router.get("/me", authmiddleware, async (req, res) => {
   console.log("🔥 /me route HIT");
  try {
    const user = await User.findById(req.user.id).select("-hashedPassword");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    console.error("Error in /me route:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
