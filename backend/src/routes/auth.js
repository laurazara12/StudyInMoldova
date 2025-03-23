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
        success: true,
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
  try {
    console.log('Începe preluarea utilizatorilor');
    console.log('Utilizator curent:', req.user);

    // Verificăm dacă utilizatorul este admin
    if (!req.user || req.user.role !== 'admin') {
      console.log('Acces interzis - utilizatorul nu este admin:', req.user);
      return res.status(403).json({ 
        message: 'Acces interzis. Doar administratorii pot accesa această pagină.' 
      });
    }

    // Verificăm conexiunea la baza de date
    db.get('SELECT 1', (err) => {
      if (err) {
        console.error('Eroare la conectarea la baza de date:', err);
        return res.status(500).json({ 
          message: 'Eroare la conectarea la baza de date',
          error: err.message 
        });
      }

      // Verificăm dacă tabela users există
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, table) => {
        if (err) {
          console.error('Eroare la verificarea tabelei users:', err);
          return res.status(500).json({ 
            message: 'Eroare la verificarea structurii bazei de date',
            error: err.message 
          });
        }

        if (!table) {
          console.error('Tabela users nu există');
          return res.status(500).json({ 
            message: 'Structura bazei de date invalidă',
            error: 'Tabela users nu există'
          });
        }

        // Query simplificat
        const query = 'SELECT id, email, name, role FROM users';
        console.log('Executare query:', query);

        // Executăm query-ul
        db.all(query, (err, users) => {
          if (err) {
            console.error('Eroare la preluarea utilizatorilor:', err);
            return res.status(500).json({ 
              message: 'Eroare la preluarea utilizatorilor',
              error: err.message 
            });
          }

          // Verificăm dacă avem date
          if (!users) {
            console.log('Nu s-au găsit utilizatori');
            return res.json([]);
          }

          console.log('Utilizatori găsiți:', users.length);
          res.json(users);
        });
      });
    });
  } catch (error) {
    console.error('Eroare la preluarea utilizatorilor:', error);
    res.status(500).json({ 
      message: 'Eroare internă server',
      error: error.message 
    });
  }
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

// Ruta pentru obținerea datelor utilizatorului curent
router.get('/me', authMiddleware, (req, res) => {
  try {
    db.get('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id], (err, user) => {
      if (err) {
        console.error('Error fetching user data:', err);
        return res.status(500).json({
          success: false,
          message: 'Eroare la preluarea datelor utilizatorului'
        });
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilizatorul nu a fost găsit'
        });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la preluarea datelor utilizatorului'
    });
  }
});

// Funcție helper pentru a obține un utilizator după ID
const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(user);
    });
  });
};

// Ruta pentru ștergerea unui utilizator
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    console.log('Încercare de ștergere pentru utilizatorul:', userId);
    
    // Verifică dacă utilizatorul există și nu este admin
    const userToDelete = await getUserById(userId);
    console.log('Utilizator găsit:', userToDelete);
    
    if (!userToDelete) {
      console.log('Utilizatorul nu a fost găsit:', userId);
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });
    }
    
    if (userToDelete.role === 'admin') {
      console.log('Încercare de ștergere a unui administrator:', userId);
      return res.status(403).json({ message: 'Nu puteți șterge un administrator' });
    }

    // Șterge utilizatorul
    const query = 'DELETE FROM users WHERE id = ?';
    db.run(query, [userId], function(err) {
      if (err) {
        console.error('Eroare la ștergerea utilizatorului:', err);
        return res.status(500).json({ message: 'Eroare la ștergerea utilizatorului' });
      }
      
      if (this.changes === 0) {
        console.log('Nu s-a șters niciun utilizator:', userId);
        return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });
      }
      
      console.log('Utilizator șters cu succes:', userId);
      res.status(200).json({ message: 'Utilizator șters cu succes' });
    });
  } catch (error) {
    console.error('Eroare la ștergerea utilizatorului:', error);
    res.status(500).json({ message: 'Eroare internă server' });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

module.exports = router;