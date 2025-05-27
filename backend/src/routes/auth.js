// /backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { auth, adminAuth } = require('../middleware/auth');
const { register, login, getUserProfile, getCurrentUser, getUserRole } = require('../controllers/userController');

// Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Toate câmpurile sunt obligatorii'
      });
    }

    const result = await register(name, email, password);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Înregistrare reușită',
      data: {
        user: result.user,
        token: result.token
      }
    });
  } catch (error) {
    console.error('Eroare la înregistrare:', error);
    res.status(500).json({
      success: false,
      message: 'A apărut o eroare în timpul înregistrării'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('=== Începe procesul de autentificare ===');
    console.log('Body primit:', req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      console.error('Email sau parolă lipsă');
      return res.status(400).json({
        success: false,
        message: 'Email și parolă sunt obligatorii'
      });
    }

    const result = await login(email, password);
    
    if (!result.success) {
      console.error('Autentificare eșuată:', result.message);
      return res.status(401).json({
        success: false,
        message: result.message
      });
    }

    console.log('Autentificare reușită pentru:', email);
    res.json({
      success: true,
      message: 'Autentificare reușită',
      data: result.data
    });
  } catch (error) {
    console.error('Eroare la autentificare:', error);
    res.status(500).json({
      success: false,
      message: 'A apărut o eroare în timpul autentificării'
    });
  }
});

// Get current user data
router.get('/me', auth, getCurrentUser);

// Ruta pentru obținerea rolului utilizatorului
router.get('/user/role', auth, async (req, res) => {
  try {
    const result = await getUserRole(req.user.id);
    
    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Rol utilizator preluat cu succes',
      data: {
        role: result.role
      }
    });
  } catch (error) {
    console.error('Eroare la obținerea rolului utilizatorului:', error);
    res.status(500).json({
      success: false,
      message: 'A apărut o eroare în timpul preluării rolului utilizatorului'
    });
  }
});

// List users (only for admin)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    console.log('Starting user retrieval');
    console.log('Current user:', req.user);

    const users = await User.findAll({
      attributes: ['id', 'email', 'name', 'role'],
      order: [['id', 'DESC']]
    });

    console.log('Users found:', users.length);
    res.json(users);
  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).json({ message: 'Error retrieving users' });
  }
});

// Temporary endpoint for checking users (only for development)
router.get('/check-users', (req, res) => {
  User.findAll().then(users => {
    console.log('Existing users:', users);
    res.json(users);
  }).catch(err => {
    console.error('Error checking users:', err);
    res.status(500).json({ message: err.message });
  });
});

// Helper function to get a user by ID
const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    User.findByPk(id).then(user => {
      if (user) {
        resolve(user);
      } else {
        reject(new Error('User not found'));
      }
    }).catch(reject);
  });
};

// Delete a user
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    console.log('Delete attempt for user:', userId);
    
    // Check if the user exists and is not admin
    const userToDelete = await getUserById(userId);
    console.log('User found:', userToDelete);
    
    if (!userToDelete) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (userToDelete.role === 'admin') {
      console.log('Delete attempt for admin:', userId);
      return res.status(403).json({ message: 'Cannot delete an administrator' });
    }

    // Delete only the user, keeping the documents
    await userToDelete.destroy();
    console.log('User deleted successfully:', userId);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Update user profile
router.put('/update-profile', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizatorul nu a fost găsit'
      });
    }

    // Actualizează doar câmpurile permise
    const allowedFields = [
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
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    await user.update(updateData);

    res.json({
      success: true,
      message: 'Profilul a fost actualizat cu succes',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...updateData
      }
    });
  } catch (error) {
    console.error('Eroare la actualizarea profilului:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la actualizarea profilului'
    });
  }
});

// Endpoint pentru verificarea validității token-ului
router.get('/verify-token', auth, (req, res) => {
  try {
    const response = {
      success: true,
      user: req.user
    };

    // Verificăm dacă există un token nou în header
    const newToken = res.getHeader('X-New-Token');
    if (newToken) {
      response.token = newToken;
    }

    res.json(response);
  } catch (error) {
    console.error('Eroare la verificarea token-ului:', error);
    res.status(401).json({
      success: false,
      message: 'Token invalid'
    });
  }
});

module.exports = router;