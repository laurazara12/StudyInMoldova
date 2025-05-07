const express = require('express');
const router = express.Router();
const universityController = require('../controllers/universityController');
const { authenticateToken } = require('../middleware/auth');

// Rute publice
router.get('/', universityController.getAllUniversities);
router.get('/:id', universityController.getUniversityById);

// Rute protejate (necesită autentificare)
router.post('/', authenticateToken, universityController.createUniversity);
router.put('/:id', authenticateToken, universityController.updateUniversity);
router.delete('/:id', authenticateToken, universityController.deleteUniversity);

module.exports = router; 