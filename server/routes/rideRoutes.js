const express = require('express');
const router = express.Router();
const {
  getAllRides,
  getRideById,
  createRide,
  updateRide,
  deleteRide,
  getRidesByUser
} = require('../controllers/rideController');

// @route   GET /api/rides
// @desc    Get all rides
router.get('/', getAllRides);

// @route   GET /api/rides/user/:user_name
// @desc    Get rides by user name
router.get('/user/:user_name', getRidesByUser);

// @route   GET /api/rides/:id
// @desc    Get single ride by ID
router.get('/:id', getRideById);

// @route   POST /api/rides
// @desc    Create new ride
router.post('/', createRide);

// @route   PUT /api/rides/:id
// @desc    Update ride
router.put('/:id', updateRide);

// @route   DELETE /api/rides/:id
// @desc    Delete ride
router.delete('/:id', deleteRide);

module.exports = router;
