const { Application, Program, User, Document } = require('../models');

exports.createApplication = async (req, res) => {
  try {
    const { programId, documents } = req.body;
    const userId = req.user.userId;

    // Verificăm dacă programul există
    const program = await Program.findByPk(programId);
    if (!program) {
      return res.status(404).json({ message: 'Programul nu a fost găsit' });
    }

    // Verificăm dacă utilizatorul are deja o aplicație pentru acest program
    const existingApplication = await Application.findOne({
      where: { userId, programId }
    });
    if (existingApplication) {
      return res.status(400).json({ message: 'Aveți deja o aplicație pentru acest program' });
    }

    // Creăm aplicația
    const application = await Application.create({
      userId,
      programId,
      status: 'pending',
      documents
    });

    res.status(201).json(application);
  } catch (error) {
    console.error('Eroare la crearea aplicației:', error);
    res.status(500).json({ message: 'Eroare la crearea aplicației' });
  }
};

exports.getUserApplications = async (req, res) => {
  try {
    const applications = await Application.findAll({
      where: { userId: req.user.userId },
      include: [
        { model: Program },
        { model: Document }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(applications);
  } catch (error) {
    console.error('Eroare la obținerea aplicațiilor:', error);
    res.status(500).json({ message: 'Eroare la obținerea aplicațiilor' });
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      },
      include: [
        { model: Program },
        { model: Document }
      ]
    });

    if (!application) {
      return res.status(404).json({ message: 'Aplicația nu a fost găsită' });
    }

    res.json(application);
  } catch (error) {
    console.error('Eroare la obținerea aplicației:', error);
    res.status(500).json({ message: 'Eroare la obținerea aplicației' });
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const { documents } = req.body;
    const application = await Application.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!application) {
      return res.status(404).json({ message: 'Aplicația nu a fost găsită' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Aplicația nu poate fi actualizată' });
    }

    application.documents = documents;
    await application.save();

    res.json(application);
  } catch (error) {
    console.error('Eroare la actualizarea aplicației:', error);
    res.status(500).json({ message: 'Eroare la actualizarea aplicației' });
  }
};

exports.cancelApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!application) {
      return res.status(404).json({ message: 'Aplicația nu a fost găsită' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Aplicația nu poate fi anulată' });
    }

    application.status = 'cancelled';
    await application.save();

    res.json({ message: 'Aplicație anulată cu succes' });
  } catch (error) {
    console.error('Eroare la anularea aplicației:', error);
    res.status(500).json({ message: 'Eroare la anularea aplicației' });
  }
}; 