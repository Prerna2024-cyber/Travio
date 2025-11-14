const Ride = require('../models/Ride');

// GET /api/rides
const getAllRides = async (_req, res) => {
  try {
    const rides = await Ride.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: rides.length, data: rides });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching rides', error: error.message });
  }
};

// GET /api/rides/:id
const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
    res.status(200).json({ success: true, data: ride });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching ride', error: error.message });
  }
};

// POST /api/rides
const createRide = async (req, res) => {
  try {
    const {
      destination,
      rideType,
      departureTime,
      status,            // optional
      initiatorId,
      participants,      // optional
      locationHistory,   // optional: [{timestamp, latitude, longitude}]
      driver,            // optional: {name, contactNumber, vehicleNumber, aadhar, licence}
    } = req.body;

    const ride = await Ride.create({
      destination,
      rideType,
      departureTime,
      status,
      initiatorId,
      participants,
      locationHistory,
      driver,
    });

    res.status(201).json({ success: true, message: 'Ride created successfully', data: ride });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((v) => v.message);
      return res.status(400).json({ success: false, message: 'Validation Error', errors: messages });
    }
    res.status(500).json({ success: false, message: 'Error creating ride', error: error.message });
  }
};

// PUT /api/rides/:id
const updateRide = async (req, res) => {
  try {
    const {
      destination,
      rideType,
      departureTime,
      status,
      initiatorId,
      participants,
      locationHistory,
      driver,
    } = req.body;

    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

    const updatedRide = await Ride.findByIdAndUpdate(
      req.params.id,
      {
        destination,
        rideType,
        departureTime,
        status,
        initiatorId,
        participants,
        locationHistory,
        driver,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: 'Ride updated successfully', data: updatedRide });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((v) => v.message);
      return res.status(400).json({ success: false, message: 'Validation Error', errors: messages });
    }
    res.status(500).json({ success: false, message: 'Error updating ride', error: error.message });
  }
};

// DELETE /api/rides/:id
const deleteRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

    await Ride.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Ride deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting ride', error: error.message });
  }
};

// GET /api/rides/user/:userId  (by initiator)
const getRidesByUser = async (req, res) => {
  try {
    const rides = await Ride.find({ initiatorId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: rides.length, data: rides });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching rides for user', error: error.message });
  }
};

module.exports = {
  getAllRides,
  getRideById,
  createRide,
  updateRide,
  deleteRide,
  getRidesByUser,
};
