const Ride = require('../models/Ride');

// @desc    Get all rides
// @route   GET /api/rides
// @access  Public
const getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find().sort({ timestamp: -1 });
    res.status(200).json({
      success: true,
      count: rides.length,
      data: rides
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching rides',
      error: error.message
    });
  }
};

// @desc    Get single ride
// @route   GET /api/rides/:id
// @access  Public
const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    res.status(200).json({
      success: true,
      data: ride
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ride',
      error: error.message
    });
  }
};

// @desc    Create new ride
// @route   POST /api/rides
// @access  Public
const createRide = async (req, res) => {
  try {
    const { user_name, pickup_location, destination, status } = req.body;

    const ride = await Ride.create({
      user_name,
      pickup_location,
      destination,
      status: status || 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Ride created successfully',
      data: ride
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating ride',
      error: error.message
    });
  }
};

// @desc    Update ride
// @route   PUT /api/rides/:id
// @access  Public
const updateRide = async (req, res) => {
  try {
    const { user_name, pickup_location, destination, status } = req.body;
    
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    const updatedRide = await Ride.findByIdAndUpdate(
      req.params.id,
      { user_name, pickup_location, destination, status },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Ride updated successfully',
      data: updatedRide
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating ride',
      error: error.message
    });
  }
};

// @desc    Delete ride
// @route   DELETE /api/rides/:id
// @access  Public
const deleteRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    await Ride.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Ride deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting ride',
      error: error.message
    });
  }
};

// @desc    Get rides by user name
// @route   GET /api/rides/user/:user_name
// @access  Public
const getRidesByUser = async (req, res) => {
  try {
    const rides = await Ride.find({ user_name: req.params.user_name }).sort({ timestamp: -1 });
    
    res.status(200).json({
      success: true,
      count: rides.length,
      data: rides
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching rides for user',
      error: error.message
    });
  }
};

module.exports = {
  getAllRides,
  getRideById,
  createRide,
  updateRide,
  deleteRide,
  getRidesByUser
};
