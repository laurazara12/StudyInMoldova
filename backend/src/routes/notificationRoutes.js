const express = require('express');
const router = express.Router();
const { 
  getUserNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/auth');
const { Notification } = require('../models');

// Toate rutele necesită autentificare
router.use(authMiddleware);

// Obține toate notificările pentru utilizatorul curent
router.get('/', async (req, res) => {
  try {
    console.log('Începe preluarea notificărilor pentru utilizatorul:', req.user.id);
    
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['createdAt', 'DESC']],
      raw: true
    });

    console.log('Notificări găsite:', notifications.length);

    // Formatăm notificările pentru a asigura structura corectă
    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      user_id: notification.user_id,
      type: notification.type || 'general',
      title: notification.title || 'Notificare nouă',
      message: notification.message || '',
      admin_message: notification.admin_message || null,
      is_read: notification.is_read || false,
      is_admin_notification: notification.is_admin_notification || false,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt
    }));

    console.log('Notificări formatate:', formattedNotifications);

    res.json({
      success: true,
      message: 'Notificările au fost preluate cu succes',
      data: formattedNotifications
    });
  } catch (error) {
    console.error('Eroare la preluarea notificărilor:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la preluarea notificărilor',
      error: error.message
    });
  }
});

// Marchează o notificare ca citită
router.post('/:id/mark-read', async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificarea nu a fost găsită'
      });
    }

    await notification.update({ is_read: true });

    res.json({
      success: true,
      message: 'Notificarea a fost marcată ca citită'
    });
  } catch (error) {
    console.error('Eroare la marcarea notificării:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la marcarea notificării',
      error: error.message
    });
  }
});

// Marchează toate notificările ca citite
router.post('/mark-all-read', async (req, res) => {
  try {
    await Notification.update(
      { is_read: true },
      {
        where: {
          user_id: req.user.id,
          is_read: false
        }
      }
    );

    res.json({
      success: true,
      message: 'Toate notificările au fost marcate ca citite'
    });
  } catch (error) {
    console.error('Eroare la marcarea notificărilor:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la marcarea notificărilor',
      error: error.message
    });
  }
});

// Șterge o notificare
router.delete('/:id', async (req, res) => {
  try {
    await deleteNotification(req.params.id, req.user.id);
    res.json({ message: 'Notificare ștearsă cu succes' });
  } catch (error) {
    console.error('Eroare la ștergerea notificării:', error);
    res.status(500).json({ 
      message: 'Eroare la ștergerea notificării',
      error: error.message 
    });
  }
});

module.exports = router; 