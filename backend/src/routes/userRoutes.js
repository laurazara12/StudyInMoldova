const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../controllers/authController');

// Rute protejate
router.use(verifyToken);

// Obține datele utilizatorului curent
router.get('/me', userController.getCurrentUser);

module.exports = router; 