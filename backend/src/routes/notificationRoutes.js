const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/auth');

// Get all notifications for the current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await getNotifications(req.user.id);
    res.setHeader('Content-Type', 'application/json');
    res.json(notifications);
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ message: 'Error getting notifications' });
  }
});

// Mark notification as read
router.post('/:id/mark-read', authMiddleware, async (req, res) => {
  try {
    const notification = await markAsRead(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.setHeader('Content-Type', 'application/json');
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking notification as read' });
  }
});

// Mark all notifications as read
router.post('/mark-all-read', authMiddleware, async (req, res) => {
  try {
    const notifications = await getNotifications(req.user.id);
    for (const notification of notifications) {
      await markAsRead(notification.id);
    }
    res.setHeader('Content-Type', 'application/json');
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Error marking all notifications as read' });
  }
});

module.exports = router; 