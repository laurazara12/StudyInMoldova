// /backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    console.log('=== Începe verificarea autentificării ===');
    console.log('Auth Header:', req.headers.authorization);
    console.log('Request URL:', req.originalUrl);
    console.log('Request Method:', req.method);
    
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('Header de autorizare lipsă');
      return res.status(401).json({
        success: false,
        message: 'Token de autorizare lipsă'
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token extras:', token ? 'prezent' : 'lipsă');

    if (!token) {
      console.log('Token lipsă din header');
      return res.status(401).json({
        success: false,
        message: 'Token lipsă'
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('EROARE: JWT_SECRET nu este configurat');
      return res.status(500).json({ 
        success: false,
        message: 'Eroare de configurare a serverului' 
      });
    }

    try {
      console.log('Încercare verificare token...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decodat:', decoded);

      const userId = decoded.id || decoded.userId;
      if (!userId) {
        console.log('Token invalid - nu conține ID utilizator');
        return res.status(401).json({
          success: false,
          message: 'Token invalid'
        });
      }

      console.log('Căutare utilizator cu ID:', userId);
      const user = await User.findByPk(userId, {
        attributes: [
          'id', 
          'email', 
          'role', 
          'name',
          'phone',
          'date_of_birth',
          'country_of_origin',
          'nationality',
          'desired_study_level',
          'preferred_study_field',
          'desired_academic_year',
          'preferred_study_language',
          'estimated_budget',
          'accommodation_preferences'
        ]
      });

      if (!user) {
        console.log('Utilizator negăsit pentru ID:', userId);
        return res.status(401).json({
          success: false,
          message: 'Utilizator negăsit'
        });
      }

      console.log('Utilizator găsit:', {
        id: user.id,
        email: user.email,
        role: user.role
      });

      req.user = user;
      console.log('=== Verificare autentificare finalizată cu succes ===');
      next();
    } catch (jwtError) {
      console.error('Eroare la verificarea token-ului:', jwtError);
      
      if (jwtError.name === 'TokenExpiredError') {
        console.log('Token expirat');
        return res.status(401).json({
          success: false,
          message: 'Token expirat',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Token invalid'
      });
    }
  } catch (error) {
    console.error('Eroare autentificare:', error);
    return res.status(500).json({
      success: false,
      message: 'Eroare la autentificare'
    });
  }
};

const adminMiddleware = (req, res, next) => {
  console.log('=== Verificare rol admin ===');
  console.log('Utilizator curent:', req.user);
  
  if (!req.user || req.user.role !== 'admin') {
    console.log('Acces refuzat - rol neautorizat');
    return res.status(403).json({ 
      success: false,
      message: 'Acces interzis. Doar administratorii pot accesa această pagină.' 
    });
  }
  
  console.log('=== Verificare rol admin finalizată cu succes ===');
  next();
};

module.exports = { authMiddleware, adminMiddleware };