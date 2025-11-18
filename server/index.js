const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/database");
const userRoutes = require("./routes/userRoutes");
const rideRoutes = require("./routes/rideRoutes");
const chatRoutes = require("./routes/chatRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const authRoute = require("./routes/authroutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ------------ Global Middlewares ------------
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve frontend static folder
app.use(express.static(path.join(__dirname, "..", "client")));

// ------------ Start Server After DB Connect ------------
const startServer = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await connectDB();
    console.log("✅ MongoDB connected.");

    // Register routes AFTER DB is connected
    app.use("/api/auth", authRoute);
    app.use("/api/users", userRoutes);
    app.use("/api/rides", rideRoutes);
    app.use("/api/chats", chatRoutes);
    app.use("/api/reviews", reviewRoutes);

    // Main frontend
    app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "..", "client", "login.html"));
    });

    // Global error handler
    app.use((err, req, res, next) => {
      console.error(err);
      res.status(500).json({ 
        success: false, 
        message: "Internal Server Error" 
      });
    });

    // SINGLE app.listen
    app.listen(PORT, () => {
     console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🌐 Frontend: http://localhost:${PORT}`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
    });

  } catch (err) {
    console.error("❌ Error starting server:", err);
  }
};

startServer();
``