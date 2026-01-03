const express = require('express');
const router = express.Router();

const { adminLogin, adminSignup } = require('../controllers/AdminController');
const adminAuth = require('../middleware/adminAuth');

// public
router.post('/login', adminLogin);

// protected
router.post('/signup', adminAuth, adminSignup);
router.get('/dashboard', adminAuth, (req, res) => {
  res.json({ message: 'Welcome to Admin Dashboard' });
});

module.exports = router;
