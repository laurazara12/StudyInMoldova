const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const userController = require('../controllers/userController');

// Aplicăm middleware-ul de autentificare pentru toate rutele
router.use(authMiddleware);

// Ruta pentru obținerea rolului utilizatorului
router.get('/role', userController.getUserRole);

// Ruta pentru obținerea profilului utilizatorului
router.get('/profile', userController.getUserProfile);

// Ruta pentru actualizarea profilului utilizatorului
router.put('/profile', userController.updateUserProfile);

// Ruta pentru ștergerea utilizatorului
router.delete('/profile', userController.deleteUser);

// Ruta pentru obținerea datelor utilizatorului curent
router.get('/me', userController.getCurrentUser);

// Ruta pentru actualizarea utilizatorului
router.put('/me', userController.updateUser);

// GET /api/users - Get all users (admin only)
router.get('/', async (req, res) => {
  try {
    // Verificăm dacă utilizatorul este admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Acces interzis. Doar administratorii pot vedea lista de utilizatori.' 
      });
    }

    const users = await User.findAll({
      attributes: [
        'id',
        'email',
        'name',
        'role',
        'createdAt',
        'updatedAt'
      ]
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Eroare la preluarea utilizatorilor:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la preluarea utilizatorilor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req, res) => {
  try {
    // Verificăm dacă utilizatorul este admin sau își vizualizează propriul profil
    if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ 
        success: false,
        message: 'Acces interzis' 
      });
    }

    const user = await User.findByPk(req.params.id, {
      attributes: [
        'id',
        'email',
        'name',
        'role',
        'createdAt',
        'updatedAt'
      ]
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilizatorul nu a fost găsit' 
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Eroare la preluarea utilizatorului:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la preluarea utilizatorului',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req, res) => {
  try {
    // Verificăm dacă utilizatorul este admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Acces interzis. Doar administratorii pot șterge utilizatori.' 
      });
    }

    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilizatorul nu a fost găsit' 
      });
    }
    
    await user.destroy();
    res.json({ 
      success: true,
      message: 'Utilizatorul a fost șters cu succes' 
    });
  } catch (error) {
    console.error('Eroare la ștergerea utilizatorului:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la ștergerea utilizatorului',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 