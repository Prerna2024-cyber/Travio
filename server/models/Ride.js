const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  user_name: {
    type: String,
    required: [true, 'User name is required'],
    trim: true,
    maxlength: [50, 'User name cannot be more than 50 characters']
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  // Additional fields that might be useful for a ride-sharing app
  pickup_location: {
    type: String,
    trim: true,
    maxlength: [200, 'Pickup location cannot be more than 200 characters']
  },
  destination: {
    type: String,
    trim: true,
    maxlength: [200, 'Destination cannot be more than 200 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Create a virtual field for id that returns _id as string
rideSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
rideSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Ride', rideSchema);
