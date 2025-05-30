// /backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config');
const { Application } = require('../models');

const auth = async (req, res, next) => {
  try {
    console.log('=== Middleware Autentificare ===');
    console.log('Headers primite:', req.headers);
    
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Token prezent:', !!token);
    
    if (!token) {
      console.log('Token lipsă');
      return res.status(401).json({
        success: false,
        message: 'Token lipsă'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodat:', decoded);
    
    if (!decoded || !decoded.id) {
      console.error('Token invalid sau lipsă ID în token');
      return res.status(401).json({
        success: false,
        message: 'Token invalid'
      });
    }
    
    const user = await User.findByPk(decoded.id);
    console.log('Utilizator găsit:', !!user);
    
    if (!user) {
      console.log('Utilizator invalid');
      return res.status(401).json({
        success: false,
        message: 'Utilizator invalid'
      });
    }

    // Setăm utilizatorul în request
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;
    
    console.log('Autentificare reușită pentru:', {
      id: user.id,
      role: user.role
    });
    
    next();
  } catch (error) {
    console.error('Eroare la autentificare:', error);
    res.status(401).json({
      success: false,
      message: 'Token invalid',
      error: error.message
    });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Acces interzis. Drepturi de administrator necesare.'
        });
      }
      next();
    });
  } catch (error) {
    console.error('Eroare la verificarea drepturilor de administrator:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la verificarea drepturilor de administrator.'
    });
  }
};

const applicationAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      console.log('Verificare acces aplicații:', {
        userId: req.userId,
        userRole: req.userRole
      });

      if (req.userRole !== 'admin' && req.userRole !== 'student') {
        console.log('Acces refuzat - rol invalid:', req.userRole);
        return res.status(403).json({
          success: false,
          message: 'Acces interzis. Drepturi de administrator sau student necesare.'
        });
      }
      
      console.log('Acces permis pentru:', {
        userId: req.userId,
        userRole: req.userRole
      });
      
      next();
    });
  } catch (error) {
    console.error('Eroare la verificarea drepturilor pentru aplicații:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la verificarea drepturilor pentru aplicații.'
    });
  }
};

// Adăugăm un nou middleware pentru verificarea proprietății aplicației
const applicationOwnership = async (req, res, next) => {
  try {
    // Adminii au acces la toate aplicațiile
    if (req.userRole === 'admin') {
      return next();
    }

    // Pentru studenți, verificăm dacă aplicația îi aparține
    const applicationId = req.params.id;
    const userId = req.userId;

    const application = await Application.findByPk(applicationId);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Aplicația nu a fost găsită.'
      });
    }

    if (application.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Nu aveți permisiunea de a accesa această aplicație.'
      });
    }

    next();
  } catch (error) {
    console.error('Eroare la verificarea proprietății aplicației:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la verificarea proprietății aplicației.'
    });
  }
};

module.exports = {
  auth,
  adminAuth,
  applicationAuth,
  applicationOwnership
};