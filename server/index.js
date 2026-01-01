const express = require("express");
const cors = require("cors");//*Cross-Origin Resource Sharing** - A security feature browsers use 
// to block suspicious requests.

const path = require("path");
require("dotenv").config();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const adminRoutes = require("./routes/adminroutes");


const connectDB = require("./config/database");
const userRoutes = require("./routes/userRoutes");
const rideRoutes = require("./routes/rideRoutes");
const chatRoutes = require("./routes/chatRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const authRoute = require("./routes/authroutes");


const app = express();
const PORT = process.env.PORT || 5000;
//app.use Without it, your server can't read data from requests!
// ------------ Global Middlewares ------------
// CORS Configuration - VERY IMPORTANT
app.use(cors({
  origin: "http://127.0.0.1:5500", // Your frontend URL (Live Server port)
  credentials: true // Allow cookies
}));



app.use(express.json());// This middleware lets you read JSON from requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); // ADD THIS - Parses cookies from requests

// Serve frontend static folder
// Serve HTML, CSS, JS files from  folder
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
    app.use('/api/admin', adminRoutes);

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