const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  console.log("🍪 Cookies received:", req.cookies);

  // accept BOTH tokens
  const token = req.cookies.token || req.cookies.adminToken;

  if (!token) {
    console.log("❌ No token found");
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    console.log("✅ Token decoded:", decoded);

    req.user = decoded; // contains id, role
    next();
  } catch (err) {
    console.log("❌ Token invalid:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};
