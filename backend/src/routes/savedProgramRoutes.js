const express = require('express');
const router = express.Router();
const savedProgramController = require('../controllers/savedProgramController');
const { verifyToken } = require('../controllers/authController');

// Toate rutele necesită autentificare
router.use(verifyToken);

// Rute pentru programele salvate
router.post('/', savedProgramController.saveProgram);
router.get('/', savedProgramController.getSavedPrograms);
router.delete('/:programId', savedProgramController.removeSavedProgram);

module.exports = router; 