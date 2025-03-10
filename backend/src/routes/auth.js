// /backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Înregistrare
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ message: 'Email-ul este deja înregistrat' });
          }
          return res.status(500).json({ message: err.message });
        }

        const token = jwt.sign(
          { id: this.lastID, role: 'user' },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );

        res.status(201).json({
          message: 'Utilizator creat cu succes',
          token,
          user: { id: this.lastID, email, name, role: 'user' }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Autentificare
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    if (!user) {
      return res.status(400).json({ message: 'Email sau parolă incorectă' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('Parola nu este corectă.');
      return res.status(400).json({ message: 'Email sau parolă incorectă' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  });
});

// Lista utilizatorilor (doar pentru admin)
router.get('/users', authMiddleware, adminMiddleware, (req, res) => {
  db.all('SELECT id, email, name, role, created_at FROM users', (err, users) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    res.json(users);
  });
});

module.exports = router;