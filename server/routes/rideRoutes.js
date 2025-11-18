const express = require('express');
const auth = require("../middleware/authmiddleware");

const router = express.Router();
const {
  getAllRides,
  getRideById,
  createRide,
  updateRide,
  deleteRide,
  getRidesByUser,
} = require('../controllers/rideController');

// Public
router.get('/', getAllRides);
router.get('/:id', getRideById);

// Protected
router.get('/user/:userId', auth, getRidesByUser);
router.post('/', auth, createRide);
router.put('/:id', auth, updateRide);
router.delete('/:id', auth, deleteRide);

module.exports = router;
