// /backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth Header:', authHeader);

    if (!authHeader) {
      console.log('Token is missing from header');
      return res.status(401).json({ message: 'Token is missing' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Extracted token:', token ? 'present' : 'missing');

    if (!token) {
      console.log('Token is missing after split');
      return res.status(401).json({ message: 'Token is missing' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', { id: decoded.id, role: decoded.role });

    const user = await User.findByPk(decoded.id, {
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
      console.log('User not found');
      return res.status(401).json({ message: 'User does not exist' });
    }

    req.user = user;
    console.log('User set in request:', req.user);
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const adminMiddleware = (req, res, next) => {
  console.log('Checking admin role for:', req.user);
  if (!req.user || req.user.role !== 'admin') {
    console.log('Access denied - unauthorized role');
    return res.status(403).json({ message: 'Access denied. Only administrators can access this page.' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };