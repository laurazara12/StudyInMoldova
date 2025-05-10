const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { Application, Program, University, Document } = require('../config/database');

// Obține toate aplicațiile utilizatorului
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('Căutăm aplicații pentru utilizatorul:', req.user.id);
    
    const applications = await Application.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Program,
          as: 'program',
          include: [{
            model: University,
            as: 'University',
            attributes: ['name', 'location']
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log('Aplicații găsite:', JSON.stringify(applications, null, 2));

    // Transformăm datele într-un format mai simplu și consistent
    const formattedApplications = applications.map(app => ({
      id: app.id,
      status: app.status,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      notes: app.notes || '',
      program: {
        id: app.program.id,
        name: app.program.name,
        faculty: app.program.faculty,
        degree: app.program.degree,
        university: {
          name: app.program.University?.name || 'N/A',
          location: app.program.University?.location || 'N/A'
        }
      }
    }));

    console.log('Aplicații formatate:', JSON.stringify(formattedApplications, null, 2));

    res.json({
      success: true,
      data: formattedApplications
    });
  } catch (error) {
    console.error('Eroare la preluarea aplicațiilor:', error);
    res.status(500).json({
      success: false,
      error: 'Eroare la preluarea aplicațiilor'
    });
  }
});

// Creează o nouă aplicație
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { program_id, documents } = req.body;

    if (!program_id) {
      return res.status(400).json({
        success: false,
        message: 'ID-ul programului este obligatoriu'
      });
    }

    // Verifică dacă programul există
    const program = await Program.findByPk(program_id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Programul nu a fost găsit'
      });
    }

    // Verifică documentele doar dacă sunt furnizate
    if (documents && Array.isArray(documents) && documents.length > 0) {
      const userDocuments = await Document.findAll({
        where: {
          id: documents,
          user_id: req.user.id,
          status: 'approved'
        }
      });

      if (userDocuments.length !== documents.length) {
        return res.status(400).json({
          success: false,
          message: 'Unele documente nu sunt valide sau nu au fost aprobate'
        });
      }
    }

    // Creează aplicația
    const application = await Application.create({
      user_id: req.user.id,
      program_id,
      status: 'pending',
      documents: documents || []
    });

    res.status(201).json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Eroare la crearea aplicației:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la crearea aplicației'
    });
  }
});

// Obține o aplicație specifică
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const application = await Application.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      },
      include: [
        {
          model: Program,
          include: [{
            model: University,
            attributes: ['name', 'location']
          }]
        }
      ]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Aplicația nu a fost găsită'
      });
    }

    res.json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Eroare la preluarea aplicației:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la preluarea aplicației'
    });
  }
});

module.exports = router; 