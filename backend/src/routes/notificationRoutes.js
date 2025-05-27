const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// Rute pentru utilizatori
router.get('/', auth, async (req, res) => {
  try {
    console.log('Obținere notificări pentru utilizatorul:', req.user.id);
    const notifications = await notificationController.getUserNotifications(req.user.id, req.user.role);
    res.json({
      success: true,
      message: 'Notificările au fost preluate cu succes',
      data: notifications
    });
  } catch (error) {
    console.error('Eroare la obținerea notificărilor:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea notificărilor',
      error: error.message
    });
  }
});

router.put('/:id/read', auth, async (req, res) => {
  try {
    await notificationController.markAsRead(req.params.id, req.user.id);
    res.json({
      success: true,
      message: 'Notificarea a fost marcată ca citită'
    });
  } catch (error) {
    console.error('Eroare la marcarea notificării ca citită:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la marcarea notificării ca citită',
      error: error.message
    });
  }
});

router.put('/read-all', auth, async (req, res) => {
  try {
    await notificationController.markAllAsRead(req.user.id);
    res.json({
      success: true,
      message: 'Toate notificările au fost marcate ca citite'
    });
  } catch (error) {
    console.error('Eroare la marcarea tuturor notificărilor ca citite:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la marcarea tuturor notificărilor ca citite',
      error: error.message
    });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await notificationController.deleteNotification(req.params.id, req.user.id);
    res.json({
      success: true,
      message: 'Notificarea a fost ștearsă'
    });
  } catch (error) {
    console.error('Eroare la ștergerea notificării:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la ștergerea notificării',
      error: error.message
    });
  }
});

module.exports = router; 