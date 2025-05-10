const { Application, Program, Document, User, University } = require('../models');

// Creare aplicație nouă
exports.createApplication = async (req, res) => {
  try {
    const { programId, documentIds } = req.body;
    const userId = req.user.id;

    // Verificăm dacă programul există
    const program = await Program.findByPk(programId, {
      include: [{ model: University, as: 'UniversityPrograms' }]
    });
    if (!program) {
      return res.status(404).json({ message: 'Programul nu a fost găsit' });
    }

    // Verificăm dacă utilizatorul are documentele necesare
    const documents = await Document.findAll({
      where: {
        id: documentIds,
        userId: userId
      }
    });

    if (documents.length !== documentIds.length) {
      return res.status(400).json({ message: 'Unele documente nu au fost găsite sau nu aparțin utilizatorului' });
    }

    // Verificăm dacă utilizatorul are deja o aplicație activă pentru acest program
    const existingApplication = await Application.findOne({
      where: {
        userId: userId,
        programId: programId,
        status: ['pending', 'under_review']
      }
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'Aveți deja o aplicație activă pentru acest program' });
    }

    // Creăm aplicația
    const application = await Application.create({
      userId: userId,
      programId: programId,
      status: 'pending'
    });

    // Creăm documentele asociate
    await Promise.all(documents.map(doc => 
      Document.create({
        applicationId: application.id,
        type: doc.type,
        filePath: doc.filePath,
        status: 'pending'
      })
    ));

    res.status(201).json({
      message: 'Aplicația a fost creată cu succes',
      data: application
    });
  } catch (error) {
    console.error('Eroare la crearea aplicației:', error);
    res.status(500).json({ message: 'Eroare la crearea aplicației' });
  }
};

// Obține toate aplicațiile unui utilizator
exports.getUserApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const applications = await Application.findAll({
      where: { userId },
      include: [
        { 
          model: Program,
          as: 'program',
          include: [{ 
            model: University,
            as: 'University'
          }]
        },
        { model: Document }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      message: 'Aplicațiile au fost găsite cu succes',
      data: applications
    });
  } catch (error) {
    console.error('Eroare la obținerea aplicațiilor:', error);
    res.status(500).json({ message: 'Eroare la obținerea aplicațiilor' });
  }
};

// Obține toate aplicațiile (pentru admin)
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.findAll({
      include: [
        { model: User, attributes: ['name', 'email'] },
        { 
          model: Program,
          as: 'program',
          include: [{ 
            model: University,
            as: 'University'
          }]
        },
        { model: Document }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      message: 'Aplicațiile au fost găsite cu succes',
      data: applications
    });
  } catch (error) {
    console.error('Eroare la obținerea aplicațiilor:', error);
    res.status(500).json({ message: 'Eroare la obținerea aplicațiilor' });
  }
};

// Actualizează statusul unei aplicații
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, adminNotes } = req.body;

    const application = await Application.findByPk(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Aplicația nu a fost găsită' });
    }

    await application.update({
      status,
      adminNotes: adminNotes || application.adminNotes
    });

    res.json({
      message: 'Statusul aplicației a fost actualizat cu succes',
      data: application
    });
  } catch (error) {
    console.error('Eroare la actualizarea statusului:', error);
    res.status(500).json({ message: 'Eroare la actualizarea statusului' });
  }
};

// Obține detaliile unei aplicații
exports.getApplicationDetails = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user.id;

    const application = await Application.findByPk(applicationId, {
      include: [
        { model: User, attributes: ['name', 'email'] },
        { 
          model: Program,
          as: 'program',
          include: [{ 
            model: University,
            as: 'University'
          }]
        },
        { model: Document }
      ]
    });

    if (!application) {
      return res.status(404).json({ message: 'Aplicația nu a fost găsită' });
    }

    // Verificăm dacă utilizatorul are acces la această aplicație
    if (application.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Nu aveți acces la această aplicație' });
    }

    res.json({
      message: 'Detaliile aplicației au fost găsite cu succes',
      data: application
    });
  } catch (error) {
    console.error('Eroare la obținerea detaliilor aplicației:', error);
    res.status(500).json({ message: 'Eroare la obținerea detaliilor aplicației' });
  }
}; 