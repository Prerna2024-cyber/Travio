const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const rideRoutes = require('./routes/rideRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware (basic ones first)
app.use(cors());
app.use(express.json());

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '..', 'client')));

// Test route (quick check)
app.get('/api', (req, res) => {
  res.json({
    message: "Hello from the Travio server! 👋",
    endpoints: {
      users: "/api/users",
      rides: "/api/rides"
    }
  });
});

// Start server *after* MongoDB connects
const startServer = async () => {
  try {
    console.log("🔗 Attempting MongoDB connection...");
    await connectDB();
    console.log("✅ MongoDB connection established.");

    // Register routes *after* DB connection
    app.use('/api/users', userRoutes);
    app.use('/api/rides', rideRoutes);

    // Serve main HTML file
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
    });

    // Global error handler
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
      });
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🌐 Frontend: http://localhost:${PORT}`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
  }
};

startServer();
