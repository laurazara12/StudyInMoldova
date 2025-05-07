const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');
const { verifyToken } = require('../controllers/authController');

// Rute publice
router.get('/', programController.getAllPrograms);
router.get('/:id', programController.getProgramById);

// Rute protejate
router.use(verifyToken);
router.post('/', programController.createProgram);
router.put('/:id', programController.updateProgram);
router.delete('/:id', programController.deleteProgram);

module.exports = router; 