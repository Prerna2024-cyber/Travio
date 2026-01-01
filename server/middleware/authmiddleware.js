const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // Get token from cookie (not header)
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated - Please login" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Save user info for next middleware
    req.user = decoded;

    next(); // User authenticated → proceed
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};