const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI ;
    console.log('🔗 Connecting to MongoDB:', mongoURI);
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('⚠️  Server will continue without database connection');
    // Don't exit the process, let the server run without DB
  }
};

module.exports = connectDB;
