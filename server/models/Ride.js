const mongoose = require('mongoose');

const phoneRegex = /^[0-9]{10}$/;
const aadharRegex = /^[0-9]{12}$/;
const plateRegex = /^[A-Z0-9\- ]{5,15}$/i;
const licenseRegex = /^[A-Z0-9\-]{5,20}$/i;

const locationPointSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, required: true },
    latitude: { type: Number, min: -90, max: 90, required: true },
    longitude: { type: Number, min: -180, max: 180, required: true },
  },
  { _id: false }
);

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 50 },
    contactNumber: { type: String, match: [phoneRegex, 'Contact must be 10 digits'] },
    vehicleNumber: { type: String, trim: true, match: [plateRegex, 'Invalid vehicle number'] },
    aadhar: { type: String, match: [aadharRegex, 'Aadhar must be 12 digits'] },
    licence: { type: String, trim: true, match: [licenseRegex, 'Invalid licence number'] },
  },
  { _id: false }
);

const rideSchema = new mongoose.Schema(
  {
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
      maxlength: [200, 'Destination cannot be more than 200 characters'],
    },

    rideType: {
      type: String,
      enum: ['cab', 'travelBuddy'],
      required: [true, 'Ride type is required'],
    },

    departureTime: {
      type: Date,
      required: [true, 'Departure time is required'],
      validate: {
        validator: (v) => v && v.getTime() >= Date.now(),
        message: 'Departure time must be in the future',
      },
    },

    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled',
    },

    initiatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Initiator (User) is required'],
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    locationHistory: [locationPointSchema], // optional

    // OPTIONAL driver details – can be added later
    driver: driverSchema,
  },
  { timestamps: true }
);

// Virtual id -> _id as string
rideSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
rideSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Ride', rideSchema);
