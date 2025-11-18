const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Admin full name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    match: [/^\S+@banasthali\.in$/, 'Please provide a valid email address']
  },
  contactNumber: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit contact number']
  },
  Password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  }
}, {
  timestamps: true // automatically creates createdAt and updatedAt
});

// Virtual field to return _id as a string(converting a complex ObjectId object into a string representation.)
adminSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are included in JSON
adminSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Admin', adminSchema);
