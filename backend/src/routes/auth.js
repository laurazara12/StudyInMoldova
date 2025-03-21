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
    console.log('Încercare de înregistrare pentru:', email);
    console.log('Datele primite:', { email, name, password: password ? 'prezent' : 'lipsă' });

    if (!email || !password || !name) {
      console.log('Date lipsă:', { email: !!email, password: !!password, name: !!name });
      return res.status(400).json({ 
        message: 'Toate câmpurile sunt obligatorii',
        received: { email: !!email, password: !!password, name: !!name }
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Parola hash-uită generată');

    db.run(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name],
      function(err) {
        if (err) {
          console.error('Eroare la înregistrare:', err);
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ message: 'Email-ul este deja înregistrat' });
          }
          return res.status(500).json({ message: err.message });
        }

        console.log('Utilizator creat cu succes, ID:', this.lastID);

        const token = jwt.sign(
          { id: this.lastID, role: 'user' },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );

        console.log('Token generat pentru utilizatorul nou');

        res.status(201).json({
          message: 'Utilizator creat cu succes',
          token,
          user: { id: this.lastID, email, name, role: 'user' }
        });
      }
    );
  } catch (error) {
    console.error('Eroare la înregistrare:', error);
    res.status(500).json({ message: error.message });
  }
});

// Autentificare
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Încercare de autentificare pentru:', email);
    console.log('Datele primite:', { email, password: password ? 'prezent' : 'lipsă' });
    console.log('Body complet:', req.body);

    if (!email || !password) {
      console.log('Date lipsă:', { email: !!email, password: !!password });
      return res.status(400).json({ 
        message: 'Email și parola sunt obligatorii',
        received: { email: !!email, password: !!password }
      });
    }

    // Verificăm dacă emailul este valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Email invalid:', email);
      return res.status(400).json({ message: 'Format email invalid' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        console.error('Eroare la căutarea utilizatorului:', err);
        return res.status(500).json({ message: err.message });
      }

      console.log('Utilizator găsit:', user ? {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hasPassword: !!user.password
      } : 'Nu există');

      if (!user) {
        console.log('Utilizatorul nu a fost găsit în baza de date');
        return res.status(400).json({ message: 'Email sau parolă incorectă' });
      }

      if (!user.password) {
        console.log('Utilizatorul nu are parolă setată');
        return res.status(400).json({ message: 'Cont invalid - parola nu este setată' });
      }

      console.log('Verificare parolă...');
      const validPassword = await bcrypt.compare(password, user.password);
      console.log('Parola validă:', validPassword);

      if (!validPassword) {
        console.log('Parola nu este corectă.');
        return res.status(400).json({ message: 'Email sau parolă incorectă' });
      }

      console.log('Generare token...');
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      console.log('Autentificare reușită pentru:', email);
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
  } catch (error) {
    console.error('Eroare la autentificare:', error);
    res.status(500).json({ message: error.message });
  }
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

// Endpoint temporar pentru verificarea utilizatorilor (doar pentru dezvoltare)
router.get('/check-users', (req, res) => {
  db.all('SELECT id, email, name, role FROM users', (err, users) => {
    if (err) {
      console.error('Eroare la verificarea utilizatorilor:', err);
      return res.status(500).json({ message: err.message });
    }
    console.log('Utilizatori existenți:', users);
    res.json(users);
  });
});

module.exports = router;