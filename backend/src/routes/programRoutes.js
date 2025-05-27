const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const programController = require('../controllers/programController');

// Rute publice
router.get('/', programController.getAllPrograms);
router.get('/:id', programController.getProgramById);

// Rute protejate
router.use(auth);

// Rute pentru admin
router.post('/', adminAuth, programController.createProgram);
router.put('/:id', adminAuth, programController.updateProgram);
router.delete('/:id', adminAuth, programController.deleteProgram);

module.exports = router; 