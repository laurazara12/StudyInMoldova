const { Application, Program, User, Document, University } = require('../models');

exports.createApplication = async (req, res) => {
  try {
    const { programId, documents } = req.body;
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

    // Verificăm dacă utilizatorul are deja o aplicație pentru acest program
    const existingApplication = await Application.findOne({
      where: { user_id, program_id: programId }
    });
    if (existingApplication) {
      return res.status(400).json({ 
        success: false,
        message: 'Aveți deja o aplicație pentru acest program',
        data: null
      });
    }

    // Creăm aplicația
    const application = await Application.create({
      user_id,
      program_id: programId,
      status: 'pending',
      documents
    });

    res.status(201).json({
      success: true,
      message: 'Aplicația a fost creată cu succes',
      data: application
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
          include: [{
            model: University,
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
      program: app.Program ? {
        id: app.Program.id,
        name: app.Program.name,
        faculty: app.Program.faculty,
        degree: app.Program.degree,
        university: {
          name: app.Program.University?.name || 'N/A',
          location: app.Program.University?.location || 'N/A'
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

    res.json({
      success: true,
      message: applications.length === 0 ? 'La moment nu există aplicații în profilul dumneavoastră' : 'Aplicațiile au fost preluate cu succes',
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
    console.error('Eroare la obținerea aplicațiilor:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la obținerea aplicațiilor',
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
        message: 'Aplicația nu a fost găsită',
        data: null
      });
    }

    const formattedApplication = {
      id: application.id,
      status: application.status,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      notes: application.notes || '',
      program: application.Program ? {
        id: application.Program.id,
        name: application.Program.name,
        faculty: application.Program.faculty,
        degree: application.Program.degree,
        university: {
          name: application.Program.University?.name || 'N/A',
          location: application.Program.University?.location || 'N/A'
        }
      } : null,
      documents: application.documents || []
    };

    res.json({
      success: true,
      message: 'Aplicația a fost preluată cu succes',
      data: formattedApplication
    });
  } catch (error) {
    console.error('Eroare la obținerea aplicației:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la obținerea aplicației',
      error: error.message,
      data: null
    });
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const { documents } = req.body;
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
        message: 'Aplicația nu a fost găsită',
        data: null
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ 
        success: false,
        message: 'Aplicația nu poate fi actualizată',
        data: null
      });
    }

    application.documents = documents;
    await application.save();

    const formattedApplication = {
      id: application.id,
      status: application.status,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      notes: application.notes || '',
      program: application.Program ? {
        id: application.Program.id,
        name: application.Program.name,
        faculty: application.Program.faculty,
        degree: application.Program.degree,
        university: {
          name: application.Program.University?.name || 'N/A',
          location: application.Program.University?.location || 'N/A'
        }
      } : null,
      documents: application.documents || []
    };

    res.json({
      success: true,
      message: 'Aplicația a fost actualizată cu succes',
      data: formattedApplication
    });
  } catch (error) {
    console.error('Eroare la actualizarea aplicației:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la actualizarea aplicației',
      error: error.message,
      data: null
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

    application.status = 'cancelled';
    await application.save();

    const formattedApplication = {
      id: application.id,
      status: application.status,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      notes: application.notes || '',
      program: application.Program ? {
        id: application.Program.id,
        name: application.Program.name,
        faculty: application.Program.faculty,
        degree: application.Program.degree,
        university: {
          name: application.Program.University?.name || 'N/A',
          location: application.Program.University?.location || 'N/A'
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