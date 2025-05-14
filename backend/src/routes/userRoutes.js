const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Rute protejate
router.use(authMiddleware);

// Rute pentru admin
router.get('/', adminMiddleware, userController.getAllUsers);
router.get('/:id', adminMiddleware, userController.getUserById);
router.put('/:id', adminMiddleware, userController.updateUser);
router.delete('/:id', adminMiddleware, userController.deleteUser);

// Obține datele utilizatorului curent
router.get('/me', userController.getCurrentUser);

module.exports = router; 