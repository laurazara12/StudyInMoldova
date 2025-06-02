// /backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config');
const { Application } = require('../models');

const auth = async (req, res, next) => {
  try {
    console.log('=== Authentication Middleware ===');
    console.log('Received headers:', req.headers);
    
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Token present:', !!token);
    
    if (!token) {
      console.log('Missing token');
      return res.status(401).json({
        success: false,
        message: 'Missing token'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    if (!decoded || !decoded.id) {
      console.error('Invalid token or missing ID in token');
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    const user = await User.findByPk(decoded.id);
    console.log('User found:', !!user);
    
    if (!user) {
      console.log('Invalid user');
      return res.status(401).json({
        success: false,
        message: 'Invalid user'
      });
    }

    // Set user in request
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;
    
    console.log('Authentication successful for:', {
      id: user.id,
      role: user.role
    });
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token',
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
          message: 'Access denied. Administrator rights required.'
        });
      }
      next();
    });
  } catch (error) {
    console.error('Error checking administrator rights:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking administrator rights.'
    });
  }
};

const applicationAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      console.log('Checking application access:', {
        userId: req.userId,
        userRole: req.userRole
      });

      if (req.userRole !== 'admin' && req.userRole !== 'user') {
        console.log('Access denied - invalid role:', req.userRole);
        return res.status(403).json({
          success: false,
          message: 'Access denied. Administrator or user rights required.'
        });
      }
      
      console.log('Access granted for:', {
        userId: req.userId,
        userRole: req.userRole
      });
      
      next();
    });
  } catch (error) {
    console.error('Error checking application rights:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking application rights.'
    });
  }
};

// Add a new middleware for checking application ownership
const applicationOwnership = async (req, res, next) => {
  try {
    // Admins have access to all applications
    if (req.userRole === 'admin') {
      return next();
    }

    // For users, check if the application belongs to them
    const applicationId = req.params.id;
    const userId = req.userId;

    const application = await Application.findByPk(applicationId);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.'
      });
    }

    if (application.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this application.'
      });
    }

    next();
  } catch (error) {
    console.error('Error checking application ownership:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking application ownership.'
    });
  }
};

module.exports = {
  auth,
  adminAuth,
  applicationAuth,
  applicationOwnership
};