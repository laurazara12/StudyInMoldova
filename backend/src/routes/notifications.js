const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { 
  getUserNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  createTestNotifications
} = require('../controllers/notificationController');

// Get user notifications
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await getUserNotifications(req.user.id, req.user.role);
    res.json({
      success: true,
      data: notifications,
      total: notifications.length
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving notifications',
      error: error.message
    });
  }
});

// Create test notifications
router.post('/test', auth, async (req, res) => {
  try {
    const success = await createTestNotifications(req.user.id);
    if (success) {
      res.json({
        success: true,
        message: 'Test notifications created successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error creating test notifications'
      });
    }
  } catch (error) {
    console.error('Error creating test notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating test notifications',
      error: error.message
    });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    await markAsRead(req.params.id, req.user.id);
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
});

// Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await markAllAsRead(req.user.id);
    res.json({
      success: true,
      message: 'All notifications have been marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notifications as read',
      error: error.message
    });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    await deleteNotification(req.params.id, req.user.id);
    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
});

module.exports = router; 