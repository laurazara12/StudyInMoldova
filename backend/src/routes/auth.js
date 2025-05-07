// /backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Registration
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    console.log('Registration attempt for:', email);
    console.log('Received data:', { email, name, password: password ? 'present' : 'missing' });

    if (!email || !password || !name) {
      console.log('Missing data:', { email: !!email, password: !!password, name: !!name });
      return res.status(400).json({ 
        message: 'All fields are required',
        received: { email: !!email, password: !!password, name: !!name }
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed');

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: 'user'
    });

    console.log('User created successfully');

    const token = jwt.sign(
      { id: user.id, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('Token generated for new user');

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { 
        email, 
        name, 
        role: 'user' 
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Email is already registered' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    if (!email || !password) {
      console.log('Missing data:', { email: !!email, password: !!password });
      return res.status(400).json({ 
        message: 'Email and password are required',
        received: { email: !!email, password: !!password }
      });
    }

    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verifică parola în două moduri:
    // 1. Direct (pentru parolele hardcodate)
    // 2. Cu bcrypt (pentru parolele hash-uite)
    let isValidPassword = false;
    
    // Verifică dacă parola din baza de date este hash-uită
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      // Parola este hash-uită, folosește bcrypt
      isValidPassword = await bcrypt.compare(password, user.password);
    } else {
      // Parola nu este hash-uită, verifică direct
      isValidPassword = (password === user.password);
    }
    
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('Login successful for:', email);

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get current user data
router.get('/me', authMiddleware, async (req, res) => {
  try {
    console.log('GET /api/auth/me - Începere procesare cerere');
    console.log('User ID din token:', req.user.id);
    
    const user = await User.findByPk(req.user.id, {
      attributes: [
        'id', 
        'name', 
        'email', 
        'role', 
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

    console.log('Rezultat căutare utilizator:', user ? 'Utilizator găsit' : 'Utilizator negăsit');

    if (!user) {
      console.log('Utilizatorul nu a fost găsit pentru ID:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('Date utilizator găsite:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Eroare detaliată la preluarea datelor utilizatorului:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
});

// List users (only for admin)
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
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
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
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

// Ruta pentru înregistrare
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Verifică dacă emailul există deja
    User.findOne({ where: { email } }).then(user => {
      if (user) {
        return res.status(400).json({ message: 'Emailul este deja înregistrat' });
      }

      // Creează utilizatorul nou
      bcrypt.hash(password, 10).then(hashedPassword => {
        User.create({
          email,
          password: hashedPassword,
          name,
          role: 'user'
        }).then(user => {
          res.status(201).json({ 
            message: 'Utilizator înregistrat cu succes',
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role
            }
          });
        }).catch(err => {
          console.error('Eroare la crearea utilizatorului:', err);
          res.status(500).json({ message: 'Eroare la înregistrare' });
        });
      }).catch(err => {
        console.error('Eroare la hash-area parolei:', err);
        res.status(500).json({ message: 'Eroare la înregistrare' });
      });
    }).catch(err => {
      console.error('Eroare la verificarea emailului:', err);
      res.status(500).json({ message: 'Eroare la înregistrare' });
    });
  } catch (error) {
    console.error('Eroare la înregistrare:', error);
    res.status(500).json({ message: 'Eroare la înregistrare' });
  }
});

// Update user profile
router.put('/update-profile', authMiddleware, async (req, res) => {
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
router.get('/verify-token', authMiddleware, (req, res) => {
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