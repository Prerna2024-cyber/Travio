const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

// @route   GET /api/users
// @desc    Get all users
router.get('/', getAllUsers);

// @route   GET /api/users/:id
// @desc    Get single user by ID
router.get('/:id', getUserById);

// @route   POST /api/users
// @desc    Create new user
router.post('/', createUser);

// @route   PUT /api/users/:id
// @desc    Update user
router.put('/:id', updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
router.delete('/:id', deleteUser);

module.exports = router;
