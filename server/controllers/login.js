const User = require("../models/User");
const bcrypt = require("bcrypt");

const env = require("dotenv");
const { createSecretToken } = require("../tokenGeneration/generateToken");

env.config();

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!(email && password)) {
    return res.status(400).json({ message: "All input is required" });
  }
  const user = await User.findOne({ email }).select("+hashedPassword");//hashedPassword not by default ;
  if (!(user && (await bcrypt.compare(password, user.hashedPassword)))) {
    return res.status(404).json({ message: "Invalid credentials" });
  }
  const token = createSecretToken(user._id);
  const isProd = process.env.NODE_ENV === "production";

res.cookie("token", token, {
  httpOnly: true,
  secure: isProd,// false in development
  sameSite: isProd ? "None" : "Lax",
  maxAge: 24 * 60 * 60 * 1000
});

  res.json({ token });
};
module.exports = login;