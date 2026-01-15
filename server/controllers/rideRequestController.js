const RideRequest = require('../models/RideRequest');
const Ride = require('../models/Ride');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

/* =====================================================
   SEND JOIN REQUEST
===================================================== */
const sendJoinRequest = async (req, res) => {
  try {
    const { rideId } = req.params;
    const userId = req.user.id;
    const { message } = req.body;

    // Check if ride exists
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found',
      });
    }

    // Check if user is the ride creator
    if (ride.initiatorId && ride.initiatorId.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot request your own ride',
      });
    }

    // Check if request already exists
    const existingRequest = await RideRequest.findOne({
      rideId,
      userId,
      status: 'pending',
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this ride',
      });
    }

    // Create request
    const rideRequest = new RideRequest({
      rideId,
      userId,
      message,
    });

    await rideRequest.save();

    // Create notification for ride creator
    const user = await User.findById(userId);
    const notificationMessage = `${user.name} has requested to join your ride`;

    await createNotification(
      ride.initiatorId,
      userId,
      rideId,
      'join_request',
      notificationMessage
    );

    res.status(201).json({
      success: true,
      message: 'Join request sent successfully',
      data: rideRequest,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error sending join request',
      error: err.message,
    });
  }
};

/* =====================================================
   GET JOIN REQUESTS FOR A RIDE
===================================================== */
const getRideRequests = async (req, res) => {
  try {
    const { rideId } = req.params;
    const userId = req.user.id;

    // Verify user owns the ride
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found',
      });
    }

    if (ride.initiatorId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view requests for your own rides',
      });
    }

    // Get all requests for this ride
    const requests = await RideRequest.find({ rideId })
      .populate('userId', 'name email profilePicture contactNumber')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: requests,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching join requests',
      error: err.message,
    });
  }
};

/* =====================================================
   ACCEPT JOIN REQUEST
===================================================== */
const acceptJoinRequest = async (req, res) => {
  try {
    const { rideId, requestId } = req.params;
    const userId = req.user.id;

    // Verify ride owner
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found',
      });
    }

    if (ride.initiatorId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage requests for your own rides',
      });
    }

    // Find and update request
    const rideRequest = await RideRequest.findByIdAndUpdate(
      requestId,
      { status: 'accepted' },
      { new: true }
    ).populate('userId', 'name email');

    if (!rideRequest) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Create notification for requester
    const user = await User.findById(userId);
    const notificationMessage = `Your request to join ${ride.pickup?.name || 'the ride'} has been accepted`;

    await createNotification(
      rideRequest.userId,
      userId,
      rideId,
      'request_accepted',
      notificationMessage
    );

    res.json({
      success: true,
      message: 'Join request accepted',
      data: rideRequest,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error accepting request',
      error: err.message,
    });
  }
};

/* =====================================================
   REJECT JOIN REQUEST
===================================================== */
const rejectJoinRequest = async (req, res) => {
  try {
    const { rideId, requestId } = req.params;
    const userId = req.user.id;

    // Verify ride owner
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found',
      });
    }

    if (ride.initiatorId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage requests for your own rides',
      });
    }

    // Find and update request
    const rideRequest = await RideRequest.findByIdAndUpdate(
      requestId,
      { status: 'rejected' },
      { new: true }
    ).populate('userId', 'name email');

    if (!rideRequest) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Create notification for requester
    const user = await User.findById(userId);
    const notificationMessage = `Your request to join ${ride.pickup?.name || 'the ride'} has been rejected`;

    await createNotification(
      rideRequest.userId,
      userId,
      rideId,
      'request_rejected',
      notificationMessage
    );

    res.json({
      success: true,
      message: 'Join request rejected',
      data: rideRequest,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting request',
      error: err.message,
    });
  }
};

/* =====================================================
   GET USER'S REQUEST STATUS FOR A RIDE
===================================================== */
const getUserRequestStatus = async (req, res) => {
  try {
    const { rideId } = req.params;
    const userId = req.user.id;

    const rideRequest = await RideRequest.findOne({
      rideId,
      userId,
    }).lean();

    res.json({
      success: true,
      hasRequest: !!rideRequest,
      data: rideRequest || null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching request status',
      error: err.message,
    });
  }
};

module.exports = {
  sendJoinRequest,
  getRideRequests,
  acceptJoinRequest,
  rejectJoinRequest,
  getUserRequestStatus,
};
