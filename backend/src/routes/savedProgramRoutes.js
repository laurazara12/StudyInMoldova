const express = require('express');
const router = express.Router();
const savedProgramController = require('../controllers/savedProgramController');
const { auth } = require('../middleware/auth');

// Toate rutele necesită autentificare
router.use(auth);

// Rute pentru programele salvate
router.post('/', savedProgramController.saveProgram);
router.post('/bulk', savedProgramController.saveMultiplePrograms);
router.get('/', savedProgramController.getSavedPrograms);
router.get('/check/:program_id', savedProgramController.checkIfProgramSaved);
router.delete('/:program_id', savedProgramController.unsaveProgram);

module.exports = router; 