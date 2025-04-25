// /backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Function to generate a short UUID (6 characters)
function generateShortUUID() {
  return Math.random().toString(36).substring(2, 8);
}

// Add short UUIDs to existing users
async function addShortUUIDsToUsers() {
  try {
    // Use raw query to avoid the createdAt column issue
    const users = await User.sequelize.query(
      'SELECT id, uuid FROM users WHERE uuid IS NULL',
      { type: User.sequelize.QueryTypes.SELECT }
    );

    for (const user of users) {
      const shortUUID = generateShortUUID();
      await User.sequelize.query(
        'UPDATE users SET uuid = ? WHERE id = ?',
        {
          replacements: [shortUUID, user.id],
          type: User.sequelize.QueryTypes.UPDATE
        }
      );
      console.log(`Short UUID added for user ${user.id}: ${shortUUID}`);
    }
  } catch (error) {
    console.error('Error updating UUIDs:', error);
  }
}

// Run the function when the server starts
addShortUUIDsToUsers();

// Registration
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const shortUUID = generateShortUUID();
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
      uuid: shortUUID,
      email,
      password: hashedPassword,
      name,
      role: 'user'
    });

    console.log('User created successfully, UUID:', shortUUID);

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
        uuid: shortUUID,
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
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        uuid: user.uuid,
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
    const user = await User.findOne({
      where: { id: req.user.id },
      attributes: ['id', 'name', 'email', 'role', 'uuid']
    });

    if (!user) {
      console.log('User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('User data found:', user);
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        uuid: user.uuid
      }
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data'
    });
  }
});

// List users (only for admin)
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    console.log('Starting user retrieval');
    console.log('Current user:', req.user);

    const users = await User.findAll({
      attributes: ['id', 'uuid', 'email', 'name', 'role'],
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
    const uuid = uuidv4(); // Generează un UUID unic

    // Verifică dacă emailul există deja
    User.findOne({ where: { email } }).then(user => {
      if (user) {
        return res.status(400).json({ message: 'Emailul este deja înregistrat' });
      }

      // Creează utilizatorul nou cu UUID
      bcrypt.hash(password, 10).then(hashedPassword => {
        User.create({
          uuid,
          email,
          password: hashedPassword,
          name,
          role: 'user'
        }).then(user => {
          res.status(201).json({ 
            message: 'Utilizator înregistrat cu succes',
            user: {
              id: user.id,
              uuid: user.uuid,
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

module.exports = router;