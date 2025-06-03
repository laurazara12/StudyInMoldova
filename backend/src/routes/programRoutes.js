const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const programController = require('../controllers/programController');
const { Program, Application, SavedProgram, ApplicationDocument } = require('../models');

// Rute publice
router.get('/', programController.getAllPrograms);
router.get('/:id', programController.getProgramById);

// Rute protejate
router.use(auth);

// Rute pentru admin
router.post('/', adminAuth, programController.createProgram);
router.put('/:id', adminAuth, programController.updateProgram);
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const program = await Program.findByPk(req.params.id);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Programul nu a fost găsit'
      });
    }

    // Găsim toate aplicațiile asociate cu programul
    const applications = await Application.findAll({
      where: { program_id: program.id }
    });

    // Ștergem toate înregistrările din application_documents pentru fiecare aplicație
    for (const application of applications) {
      await ApplicationDocument.destroy({
        where: { application_id: application.id }
      });
    }

    // Ștergem toate aplicațiile
    await Application.destroy({
      where: { program_id: program.id }
    });

    // Ștergem programele salvate
    await SavedProgram.destroy({
      where: { program_id: program.id }
    });

    // Ștergem programul
    await program.destroy();
    
    res.json({
      success: true,
      message: 'Programul și toate datele asociate au fost șterse cu succes'
    });
  } catch (error) {
    console.error('Error deleting program:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la ștergerea programului',
      error: error.message
    });
  }
});

module.exports = router; 