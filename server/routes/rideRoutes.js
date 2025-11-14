const express = require('express');
const router = express.Router();
const {
  getAllRides,
  getRideById,
  createRide,
  updateRide,
  deleteRide,
  getRidesByUser,
} = require('../controllers/rideController');

router.get('/', getAllRides);

// changed user param to userId, since we now use initiatorId (ObjectId)
router.get('/user/:userId', getRidesByUser);

router.get('/:id', getRideById);
router.post('/', createRide);
router.put('/:id', updateRide);
router.delete('/:id', deleteRide);

module.exports = router;

