const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("❌ MONGODB_URI is missing from your .env file");
    }

    console.log("🔗 Trying to connect to MongoDB Atlas...");

    // Establish connection
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
    });

    console.log(`🍃 MongoDB Connected Successfully`);
    console.log(`📡 Host: ${conn.connection.host}`);
    console.log(`📁 Database: ${conn.connection.name}`);

    // Connection event listeners (helpful for debugging)
    mongoose.connection.on("connected", () => {
      console.log("✅ Mongoose connected to MongoDB Atlas");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ Mongoose connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ Mongoose disconnected");
    });
  } catch (err) {
    console.error("❌ MongoDB Connection Failed!");
    console.error("Reason:", err.message);
    console.error("🛠️ Check your .env MONGODB_URI or Network Access in Atlas.");
    process.exit(1); // Stop server if DB connection fails
  }
};

module.exports = connectDB;



