const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const userController = require('../controllers/userController');

// Rute pentru utilizatori
router.get('/me', authMiddleware, userController.getMe);
router.get('/role', authMiddleware, userController.getUserRole);
router.get('/profile', authMiddleware, userController.getUserProfile);
router.put('/profile', authMiddleware, userController.updateUserProfile);
router.delete('/', authMiddleware, userController.deleteUser);
router.get('/current', authMiddleware, userController.getCurrentUser);
router.put('/', authMiddleware, userController.updateUser);

module.exports = router; 