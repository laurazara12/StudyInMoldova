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
    const result = await getUserNotifications(req.user.id, req.user.role);
    res.json(result);
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea notificărilor',
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
        message: 'Notificări de test create cu succes'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Eroare la crearea notificărilor de test'
      });
    }
  } catch (error) {
    console.error('Error creating test notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la crearea notificărilor de test',
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
      message: 'Notificare marcată ca citită'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la marcarea notificării ca citită',
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
      message: 'Toate notificările au fost marcate ca citite'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la marcarea notificărilor ca citite',
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
      message: 'Notificare ștearsă cu succes'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la ștergerea notificării',
      error: error.message
    });
  }
});

module.exports = router; 