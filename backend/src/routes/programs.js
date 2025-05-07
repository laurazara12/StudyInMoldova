const express = require('express');
const router = express.Router();
const { getAllPrograms, getProgramById, getProgramsByUniversity, createProgram, updateProgram, deleteProgram } = require('../controllers/programController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Obține toate programele
router.get('/', getAllPrograms);

// Obține programele unei universități specifice
router.get('/university/:universityId', getProgramsByUniversity);

// Obține un program specific
router.get('/:id', getProgramById);

// Adaugă un program nou (doar pentru admin)
router.post('/', authMiddleware, adminMiddleware, createProgram);

// Actualizează un program (doar pentru admin)
router.put('/:id', authMiddleware, adminMiddleware, updateProgram);

// Șterge un program (doar pentru admin)
router.delete('/:id', authMiddleware, adminMiddleware, deleteProgram);

module.exports = router; 