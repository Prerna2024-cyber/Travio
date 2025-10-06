const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get('/api', (req, res) => {
  res.json({ message: "Hello from the Travio server! 👋" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});