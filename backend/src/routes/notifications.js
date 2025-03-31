const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// Obține toate notificările pentru un utilizator
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await db.all(
      'SELECT * FROM notifications WHERE user_uuid = ? ORDER BY created_at DESC',
      [req.user.uuid]
    );
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Eroare la obținerea notificărilor' });
  }
});

// Marchează o notificare ca citită
router.put('/:id/read', auth, async (req, res) => {
  try {
    await db.run(
      'UPDATE notifications SET read = 1 WHERE id = ? AND user_uuid = ?',
      [req.params.id, req.user.uuid]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Eroare la marcarea notificării ca citită' });
  }
});

// Marchează toate notificările ca citite
router.put('/read-all', auth, async (req, res) => {
  try {
    await db.run(
      'UPDATE notifications SET read = 1 WHERE user_uuid = ?',
      [req.user.uuid]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Eroare la marcarea notificărilor ca citite' });
  }
});

module.exports = router; 