const express = require('express');
const router = express.Router();

const protect = require('../middleware/authmiddleware');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notificationController');

// Get all notifications for logged-in user
router.get('/', protect, getNotifications);

// Mark specific notification as read
router.put('/:notificationId/read', protect, markAsRead);

// Mark all notifications as read
router.put('/read-all', protect, markAllAsRead);

// Delete a notification
router.delete('/:notificationId', protect, deleteNotification);

module.exports = router;
