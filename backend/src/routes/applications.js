const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { Application, Program, University } = require('../config/database');

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

    console.log('Aplicații găsite:', applications.length);

    const formattedApplications = applications.map(app => ({
      id: app.id,
      status: app.status,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      notes: app.notes || '',
      program: app.program ? {
        id: app.program.id,
        name: app.program.name,
        faculty: app.program.faculty,
        degree: app.program.degree,
        university: {
          name: app.program.University?.name || 'N/A',
          location: app.program.University?.location || 'N/A'
        }
      } : null,
      documents: app.documents || []
    }));

    const groupedApplications = {
      drafts: formattedApplications.filter(app => app.status === 'draft'),
      pending: formattedApplications.filter(app => app.status === 'pending'),
      sent: formattedApplications.filter(app => app.status === 'confirmed'),
      rejected: formattedApplications.filter(app => app.status === 'rejected'),
      withdrawn: formattedApplications.filter(app => app.status === 'withdrawn')
    };

    console.log('Aplicații grupate:', groupedApplications);

    res.json({
      success: true,
      message: applications.length === 0 ? 'La moment nu există aplicații în profilul dumneavoastră' : 'Aplicațiile au fost preluate cu succes',
      data: {
        applications: groupedApplications,
        total: applications.length,
        status: {
          drafts: groupedApplications.drafts.length,
          pending: groupedApplications.pending.length,
          sent: groupedApplications.sent.length,
          rejected: groupedApplications.rejected.length,
          withdrawn: groupedApplications.withdrawn.length
        }
      }
    });
  } catch (error) {
    console.error('Eroare la preluarea aplicațiilor:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la preluarea aplicațiilor',
      error: error.message,
      data: {
        applications: {
          drafts: [],
          pending: [],
          sent: [],
          rejected: [],
          withdrawn: []
        },
        total: 0,
        status: {
          drafts: 0,
          pending: 0,
          sent: 0,
          rejected: 0,
          withdrawn: 0
        }
      }
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

    // Creează aplicația cu status 'pending'
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

// Retrage o aplicație
router.put('/:id/withdraw', authMiddleware, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const userId = req.user.id;
    
    console.log('Încercare retragere aplicație:', {
      applicationId,
      userId,
      params: req.params,
      user: req.user,
      headers: req.headers,
      method: req.method,
      url: req.originalUrl,
      timestamp: new Date().toISOString()
    });
    
    if (!applicationId) {
      console.log('ID-ul aplicației lipsește');
      return res.status(400).json({
        success: false,
        message: 'ID-ul aplicației lipsește'
      });
    }

    // Verifică dacă aplicația există și aparține utilizatorului
    const application = await Application.findOne({
      where: {
        id: applicationId,
        user_id: userId
      },
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
      ]
    });

    console.log('Rezultat căutare aplicație:', {
      found: !!application,
      applicationId,
      userId,
      application: application ? {
        id: application.id,
        status: application.status,
        user_id: application.user_id,
        program: application.program ? {
          id: application.program.id,
          name: application.program.name
        } : null
      } : null,
      query: {
        id: applicationId,
        user_id: userId
      },
      timestamp: new Date().toISOString()
    });

    if (!application) {
      console.log('Aplicație negăsită pentru ID:', applicationId);
      return res.status(404).json({
        success: false,
        message: 'Aplicația nu a fost găsită'
      });
    }

    // Verifică dacă aplicația poate fi retrasă
    if (!['pending', 'confirmed'].includes(application.status)) {
      console.log('Status invalid pentru retragere:', application.status);
      return res.status(400).json({
        success: false,
        message: 'Doar aplicațiile în așteptare sau confirmate pot fi retrase'
      });
    }

    if (application.status === 'confirmed') {
      // Șterge aplicația dacă este confirmată
      await application.destroy();
      console.log('Aplicație confirmată ștearsă:', {
        id: application.id,
        status: application.status,
        timestamp: new Date().toISOString()
      });

      return res.json({
        success: true,
        message: 'Aplicația a fost ștearsă definitiv',
        data: null
      });
    } else {
      // Transformă în draft dacă este în așteptare
      const oldStatus = application.status;
      application.status = 'draft';
      await application.save();

      console.log('Aplicație retrasă și salvată ca draft:', {
        id: application.id,
        oldStatus,
        newStatus: 'draft',
        program: application.program ? {
          id: application.program.id,
          name: application.program.name
        } : null,
        timestamp: new Date().toISOString()
      });

      return res.json({
        success: true,
        message: 'Aplicația a fost retrasă și salvată ca draft',
        data: {
          id: application.id,
          status: application.status,
          program: application.program ? {
            id: application.program.id,
            name: application.program.name,
            university: application.program.University ? {
              name: application.program.University.name,
              location: application.program.University.location
            } : null
          } : null
        }
      });
    }
  } catch (error) {
    console.error('Eroare la retragerea aplicației:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la retragerea aplicației'
    });
  }
});

module.exports = router; 