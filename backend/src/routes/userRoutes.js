const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const userController = require('../controllers/userController');

// Rute pentru utilizatori
router.get('/me', auth, userController.getCurrentUser);
router.get('/role', auth, userController.getUserRole);
router.get('/profile', auth, userController.getUserProfile);
router.put('/profile', auth, userController.updateUserProfile);
router.delete('/', auth, userController.deleteUser);
router.get('/current', auth, userController.getCurrentUser);
router.put('/', auth, userController.updateUser);

module.exports = router; 