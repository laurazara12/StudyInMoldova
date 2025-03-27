// /backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Funcție pentru generarea unui UUID scurt (6 caractere)
function generateShortUUID() {
  return Math.random().toString(36).substring(2, 8);
}

// Adăugăm UUID-uri scurte pentru utilizatorii existenți
function addShortUUIDsToUsers() {
  db.all('SELECT id FROM users WHERE uuid IS NULL', [], (err, users) => {
    if (err) {
      console.error('Eroare la selectarea utilizatorilor:', err);
      return;
    }

    users.forEach(user => {
      const shortUUID = generateShortUUID();
      db.run('UPDATE users SET uuid = ? WHERE id = ?', [shortUUID, user.id], (err) => {
        if (err) {
          console.error(`Eroare la actualizarea UUID pentru utilizatorul ${user.id}:`, err);
        } else {
          console.log(`UUID scurt adăugat pentru utilizatorul ${user.id}: ${shortUUID}`);
        }
      });
    });
  });
}

// Rulăm funcția la pornirea serverului
addShortUUIDsToUsers();

// Înregistrare
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const shortUUID = generateShortUUID(); // Generăm un UUID scurt
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
      'INSERT INTO users (uuid, email, password, name) VALUES (?, ?, ?, ?)',
      [shortUUID, email, hashedPassword, name],
      function(err) {
        if (err) {
          console.error('Eroare la înregistrare:', err);
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ message: 'Email-ul este deja înregistrat' });
          }
          return res.status(500).json({ message: err.message });
        }

        console.log('Utilizator creat cu succes, UUID:', shortUUID);

        const token = jwt.sign(
          { id: this.lastID, role: 'user' },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );

        console.log('Token generat pentru utilizatorul nou');

        res.status(201).json({
          message: 'Utilizator creat cu succes',
          token,
          user: { 
            uuid: shortUUID,
            email, 
            name, 
            role: 'user' 
          }
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
        uuid: user.uuid,
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
          uuid: user.uuid,
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

    // Mai întâi, ne asigurăm că toți utilizatorii au UUID
    db.all('SELECT id FROM users WHERE uuid IS NULL', [], (err, usersWithoutUuid) => {
      if (err) {
        console.error('Eroare la verificarea UUID-urilor:', err);
        return res.status(500).json({ message: 'Eroare la verificarea UUID-urilor' });
      }

      // Adăugăm UUID pentru utilizatorii care nu au
      const promises = usersWithoutUuid.map(user => {
        return new Promise((resolve, reject) => {
          const uuid = uuidv4();
          db.run('UPDATE users SET uuid = ? WHERE id = ?', [uuid, user.id], (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      });

      Promise.all(promises)
        .then(() => {
          // După ce am adăugat UUID-urile, preluăm toți utilizatorii
          const query = 'SELECT uuid, email, name, role FROM users';
          console.log('Executare query:', query);

          db.all(query, (err, users) => {
            if (err) {
              console.error('Eroare la preluarea utilizatorilor:', err);
              return res.status(500).json({ 
                message: 'Eroare la preluarea utilizatorilor',
                error: err.message 
              });
            }

            if (!users) {
              console.log('Nu s-au găsit utilizatori');
              return res.json([]);
            }

            console.log('Utilizatori găsiți:', users.length);
            res.json(users);
          });
        })
        .catch(error => {
          console.error('Eroare la actualizarea UUID-urilor:', error);
          res.status(500).json({ message: 'Eroare la actualizarea UUID-urilor' });
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

    // Șterge doar utilizatorul, păstrând documentele
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

// Ruta pentru înregistrare
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const uuid = uuidv4(); // Generează un UUID unic

    // Verifică dacă emailul există deja
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        console.error('Eroare la verificarea emailului:', err);
        return res.status(500).json({ message: 'Eroare la înregistrare' });
      }

      if (user) {
        return res.status(400).json({ message: 'Emailul este deja înregistrat' });
      }

      // Creează utilizatorul nou cu UUID
      const hashedPassword = await bcrypt.hash(password, 10);
      const query = 'INSERT INTO users (uuid, email, password, name) VALUES (?, ?, ?, ?)';
      
      db.run(query, [uuid, email, hashedPassword, name], function(err) {
        if (err) {
          console.error('Eroare la crearea utilizatorului:', err);
          return res.status(500).json({ message: 'Eroare la înregistrare' });
        }

        res.status(201).json({ 
          message: 'Utilizator înregistrat cu succes',
          user: {
            id: this.lastID,
            uuid: uuid,
            email: email,
            name: name,
            role: 'user'
          }
        });
      });
    });
  } catch (error) {
    console.error('Eroare la înregistrare:', error);
    res.status(500).json({ message: 'Eroare la înregistrare' });
  }
});

module.exports = router;