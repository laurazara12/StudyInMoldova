const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');
const { authMiddleware } = require('../middleware/auth');

// Obține toate notificările unui utilizator
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await sequelize.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      {
        replacements: [req.user.id],
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    res.json(notifications);
  } catch (error) {
    console.error('Eroare la obținerea notificărilor:', error);
    res.status(500).json({ message: 'Eroare la obținerea notificărilor' });
  }
});

// Marchează o notificare ca citită
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    await sequelize.query(
      'UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?',
      {
        replacements: [req.params.id, req.user.id],
        type: sequelize.QueryTypes.UPDATE
      }
    );
    
    res.json({ message: 'Notificare marcată ca citită' });
  } catch (error) {
    console.error('Eroare la marcarea notificării ca citită:', error);
    res.status(500).json({ message: 'Eroare la marcarea notificării ca citită' });
  }
});

// Marchează toate notificările ca citite
router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    await sequelize.query(
      'UPDATE notifications SET read = 1 WHERE user_id = ?',
      {
        replacements: [req.user.id],
        type: sequelize.QueryTypes.UPDATE
      }
    );
    
    res.json({ message: 'Toate notificările au fost marcate ca citite' });
  } catch (error) {
    console.error('Eroare la marcarea notificărilor ca citite:', error);
    res.status(500).json({ message: 'Eroare la marcarea notificărilor ca citite' });
  }
});

module.exports = router; 