const express = require('express');
const router = express.Router();
const { 
  getUserNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/auth');

// Toate rutele necesită autentificare
router.use(authMiddleware);

// Obține toate notificările utilizatorului
router.get('/', async (req, res) => {
  try {
    const notifications = await getUserNotifications(req.user.id, req.user.role);
    res.json(notifications);
  } catch (error) {
    console.error('Eroare la obținerea notificărilor:', error);
    res.status(500).json({ 
      message: 'Eroare la obținerea notificărilor',
      error: error.message 
    });
  }
});

// Marchează o notificare ca citită
router.post('/:id/mark-read', async (req, res) => {
  try {
    await markAsRead(req.params.id, req.user.id);
    res.json({ message: 'Notificare marcată ca citită' });
  } catch (error) {
    console.error('Eroare la marcarea notificării:', error);
    res.status(500).json({ 
      message: 'Eroare la marcarea notificării',
      error: error.message 
    });
  }
});

// Marchează toate notificările ca citite
router.post('/mark-all-read', async (req, res) => {
  try {
    await markAllAsRead(req.user.id);
    res.json({ message: 'Toate notificările au fost marcate ca citite' });
  } catch (error) {
    console.error('Eroare la marcarea notificărilor:', error);
    res.status(500).json({ 
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