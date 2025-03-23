// /backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth Header:', authHeader);

    if (!authHeader) {
      console.log('Token-ul lipsește din header');
      return res.status(401).json({ message: 'Token-ul lipsește' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token extras:', token ? 'prezent' : 'lipsă');

    if (!token) {
      console.log('Token-ul lipsește după split');
      return res.status(401).json({ message: 'Token-ul lipsește' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodat:', { id: decoded.id, role: decoded.role });

    db.get('SELECT * FROM users WHERE id = ?', [decoded.id], (err, user) => {
      if (err) {
        console.error('Eroare la căutarea utilizatorului:', err);
        return res.status(500).json({ message: 'Eroare la verificarea utilizatorului' });
      }

      if (!user) {
        console.log('Utilizatorul nu a fost găsit');
        return res.status(401).json({ message: 'Utilizatorul nu există' });
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role
      };
      console.log('Utilizator setat în request:', req.user);
      next();
    });
  } catch (error) {
    console.error('Eroare la verificarea token-ului:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token-ul a expirat' });
    }
    return res.status(401).json({ message: 'Token invalid' });
  }
};

const adminMiddleware = (req, res, next) => {
  console.log('Verificare rol admin pentru:', req.user);
  if (!req.user || req.user.role !== 'admin') {
    console.log('Acces interzis - rol neautorizat');
    return res.status(403).json({ message: 'Acces interzis. Doar administratorii pot accesa această pagină.' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };