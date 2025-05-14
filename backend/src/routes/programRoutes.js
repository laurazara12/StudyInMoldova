const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Rute publice
router.get('/', programController.getAllPrograms);
router.get('/:id', programController.getProgramById);

// Rute protejate
router.use(authMiddleware);

// Rute pentru admin
router.post('/', adminMiddleware, programController.createProgram);
router.put('/:id', adminMiddleware, programController.updateProgram);
router.delete('/:id', adminMiddleware, programController.deleteProgram);

module.exports = router; 