const { Application, Program, User, Document, University } = require('../models');

exports.createApplication = async (req, res) => {
  try {
    const { programId, documentIds, status = 'pending' } = req.body;
    const user_id = req.user.id;

    // Verificăm dacă programul există
    const program = await Program.findByPk(programId);
    if (!program) {
      return res.status(404).json({ 
        success: false,
        message: 'Programul nu a fost găsit',
        data: null
      });
    }

    // Verificăm dacă utilizatorul are deja o aplicație activă pentru acest program
    const existingApplication = await Application.findOne({
      where: { 
        user_id, 
        program_id: programId,
        status: ['pending', 'confirmed', 'draft'] // Verificăm doar aplicațiile active și draft-urile
      }
    });
    if (existingApplication) {
      return res.status(400).json({ 
        success: false,
        message: 'Aveți deja o aplicație activă pentru acest program',
        data: null
      });
    }

    // Creăm aplicația
    const application = await Application.create({
      user_id,
      program_id: programId,
      status,
      university_id: program.university_id
    });

    // Asociem documentele dacă există
    if (documentIds && documentIds.length > 0) {
      await application.setDocuments(documentIds);
    }

    // Încărcăm relațiile pentru răspuns
    const applicationWithRelations = await Application.findByPk(application.id, {
      include: [
        {
          model: Program,
          as: 'program',
          include: [{
            model: University,
            as: 'university'
          }]
        },
        {
          model: Document,
          as: 'documents'
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Aplicația a fost creată cu succes',
      data: applicationWithRelations
    });
  } catch (error) {
    console.error('Eroare la crearea aplicației:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la crearea aplicației',
      error: error.message,
      data: null
    });
  }
};

exports.getUserApplications = async (req, res) => {
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
            as: 'university',
            attributes: ['name', 'location']
          }]
        },
        {
          model: Document,
          as: 'documents'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log('Aplicații găsite:', applications.length);
    console.log('Prima aplicație:', JSON.stringify(applications[0], null, 2));

    // Inițializăm toate grupurile cu array-uri goale
    const groupedApplications = {
      drafts: [],
      pending: [],
      sent: [],
      rejected: [],
      withdrawn: []
    };

    // Formatăm și grupăm aplicațiile
    applications.forEach(app => {
      console.log('Procesăm aplicația:', app.id, 'cu status:', app.status);
      
      const formattedApp = {
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
            name: app.program.university?.name || 'N/A',
            location: app.program.university?.location || 'N/A'
          }
        } : null,
        documents: app.documents ? app.documents.map(doc => ({
          id: doc.id,
          document_type: doc.document_type,
          status: doc.status,
          filename: doc.filename,
          originalName: doc.originalName
        })) : []
      };

      // Grupăm aplicațiile după status
      switch(app.status) {
        case 'draft':
          groupedApplications.drafts.push(formattedApp);
          break;
        case 'pending':
          groupedApplications.pending.push(formattedApp);
          break;
        case 'confirmed':
          groupedApplications.sent.push(formattedApp);
          break;
        case 'rejected':
          groupedApplications.rejected.push(formattedApp);
          break;
        case 'withdrawn':
          groupedApplications.withdrawn.push(formattedApp);
          break;
        default:
          console.log('Status necunoscut pentru aplicația:', app.id, 'status:', app.status);
          groupedApplications.drafts.push(formattedApp);
          break;
      }
    });

    // Calculăm statisticile
    const status = {
      drafts: groupedApplications.drafts.length,
      pending: groupedApplications.pending.length,
      sent: groupedApplications.sent.length,
      rejected: groupedApplications.rejected.length,
      withdrawn: groupedApplications.withdrawn.length
    };

    // Verificăm și formatăm datele înainte de a le trimite
    const formattedData = {
      drafts: Array.isArray(groupedApplications.drafts) ? groupedApplications.drafts : [],
      pending: Array.isArray(groupedApplications.pending) ? groupedApplications.pending : [],
      sent: Array.isArray(groupedApplications.sent) ? groupedApplications.sent : [],
      rejected: Array.isArray(groupedApplications.rejected) ? groupedApplications.rejected : [],
      withdrawn: Array.isArray(groupedApplications.withdrawn) ? groupedApplications.withdrawn : []
    };

    // Construim răspunsul final
    const response = {
      success: true,
      message: applications.length === 0 ? 'La moment nu există aplicații în profilul dumneavoastră' : 'Aplicațiile au fost preluate cu succes',
      data: formattedData,
      total: applications.length,
      status: status
    };

    console.log('Răspuns final:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error('Eroare detaliată la obținerea aplicațiilor:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      success: false,
      message: 'Eroare la obținerea aplicațiilor',
      error: error.message,
      data: {
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
    });
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      },
      include: [
        {
          model: Program,
          as: 'program',
          include: [{
            model: University,
            as: 'university'
          }]
        },
        {
          model: Document,
          as: 'documents'
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
      data: application
    });
  } catch (error) {
    console.error('Eroare la obținerea aplicației:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea aplicației',
      error: error.message
    });
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { programId, documentIds, status } = req.body;
    const user_id = req.user.id;

    const application = await Application.findOne({
      where: { id, user_id }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Aplicația nu a fost găsită'
      });
    }

    if (programId) {
      const program = await Program.findByPk(programId);
      if (!program) {
        return res.status(404).json({
          success: false,
          message: 'Programul nu a fost găsit'
        });
      }
      application.program_id = programId;
      application.university_id = program.university_id;
    }

    if (status) {
      application.status = status;
    }

    await application.save();

    if (documentIds) {
      await application.setDocuments(documentIds);
    }

    const updatedApplication = await Application.findByPk(id, {
      include: [
        {
          model: Program,
          as: 'program',
          include: [{
            model: University,
            as: 'university'
          }]
        },
        {
          model: Document,
          as: 'documents'
        }
      ]
    });

    res.json({
      success: true,
      message: 'Aplicația a fost actualizată cu succes',
      data: updatedApplication
    });
  } catch (error) {
    console.error('Eroare la actualizarea aplicației:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la actualizarea aplicației',
      error: error.message
    });
  }
};

exports.cancelApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      },
      include: [
        { 
          model: Program,
          as: 'program',
          include: [{
            model: University,
            as: 'university',
            attributes: ['name', 'location']
          }]
        },
        {
          model: Document,
          as: 'documents'
        }
      ]
    });

    if (!application) {
      return res.status(404).json({ 
        success: false,
        message: 'Aplicația nu a fost găsită',
        data: null
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ 
        success: false,
        message: 'Aplicația nu poate fi anulată',
        data: null
      });
    }

    application.status = 'withdrawn';
    await application.save();

    const formattedApplication = {
      id: application.id,
      status: application.status,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      notes: application.notes || '',
      program: application.program ? {
        id: application.program.id,
        name: application.program.name,
        faculty: application.program.faculty,
        degree: application.program.degree,
        university: {
          name: application.program.university?.name || 'N/A',
          location: application.program.university?.location || 'N/A'
        }
      } : null,
      documents: application.documents || []
    };

    res.json({ 
      success: true,
      message: 'Aplicație anulată cu succes',
      data: formattedApplication
    });
  } catch (error) {
    console.error('Eroare la anularea aplicației:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la anularea aplicației',
      error: error.message,
      data: null
    });
  }
};

exports.getApplications = async (req, res) => {
  try {
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
        },
        {
          model: Document,
          as: 'documents'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Formatăm aplicațiile pentru a include toate informațiile necesare
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
          name: app.program.university?.name || 'N/A',
          location: app.program.university?.location || 'N/A'
        }
      } : null,
      documents: app.documents || []
    }));

    // Grupăm aplicațiile pe categorii
    const groupedApplications = {
      drafts: formattedApplications.filter(app => app.status === 'draft'),
      pending: formattedApplications.filter(app => app.status === 'pending'),
      sent: formattedApplications.filter(app => app.status === 'confirmed'),
      rejected: formattedApplications.filter(app => app.status === 'rejected'),
      withdrawn: formattedApplications.filter(app => app.status === 'withdrawn')
    };

    res.json({
      success: true,
      message: applications.length === 0 ? 'Nu există aplicații în profilul dumneavoastră' : 'Aplicațiile au fost preluate cu succes',
      data: {
        all: formattedApplications,
        grouped: groupedApplications
      },
      total: applications.length,
      status: {
        drafts: groupedApplications.drafts.length,
        pending: groupedApplications.pending.length,
        sent: groupedApplications.sent.length,
        rejected: groupedApplications.rejected.length,
        withdrawn: groupedApplications.withdrawn.length
      }
    });
  } catch (error) {
    console.error('Eroare la preluarea aplicațiilor:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la preluarea aplicațiilor',
      error: error.message,
      data: {
        all: [],
        grouped: {
          drafts: [],
          pending: [],
          sent: [],
          rejected: [],
          withdrawn: []
        }
      },
      total: 0,
      status: {
        drafts: 0,
        pending: 0,
        sent: 0,
        rejected: 0,
        withdrawn: 0
      }
    });
  }
};

exports.withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const application = await Application.findOne({
      where: { id, user_id }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Aplicația nu a fost găsită'
      });
    }

    // Verificăm dacă aplicația poate fi retrasă
    if (application.status === 'withdrawn') {
      return res.status(400).json({
        success: false,
        message: 'Aplicația a fost deja retrasă'
      });
    }

    if (application.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Nu se poate retrage o aplicație care a fost deja respinsă'
      });
    }

    // Actualizăm statusul aplicației
    application.status = 'withdrawn';
    await application.save();

    res.json({
      success: true,
      message: 'Aplicația a fost retrasă cu succes',
      data: application
    });
  } catch (error) {
    console.error('Eroare la retragerea aplicației:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la retragerea aplicației',
      error: error.message
    });
  }
}; 