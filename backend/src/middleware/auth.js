// /backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    console.log('=== Verificare Token ===');
    
    // Setăm header-urile pentru răspunsurile JSON
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Accept', 'application/json');

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Token lipsă sau format invalid');
      return res.status(401).json({
        success: false,
        message: 'Token lipsă sau format invalid'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('Token lipsă');
      return res.status(401).json({
        success: false,
        message: 'Token lipsă'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decodat:', decoded);

      const user = await User.findByPk(decoded.id);
      if (!user) {
        console.log('Utilizatorul nu a fost găsit');
        return res.status(401).json({
          success: false,
          message: 'Utilizatorul nu a fost găsit'
        });
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role
      };

      console.log('Utilizator autentificat:', req.user);
      next();
    } catch (error) {
      console.error('Eroare la verificarea token-ului:', error);
      return res.status(401).json({
        success: false,
        message: 'Token invalid sau expirat'
      });
    }
  } catch (error) {
    console.error('Eroare în middleware-ul de autentificare:', error);
    return res.status(500).json({
      success: false,
      message: 'Eroare la autentificare'
    });
  }
};

const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autentificare necesară'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acces interzis'
      });
    }

    next();
  } catch (error) {
    console.error('Eroare în middleware-ul de admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Eroare la procesarea cererii'
    });
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware
};