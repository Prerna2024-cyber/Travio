const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // 1. Check if token exists in header
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // 2. Token comes like: "Bearer xyz123..."
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Save user info for next middleware/routes
    req.user = decoded;

    next(); // user authenticated → go to next handler
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
