const { SavedProgram, Program, University } = require('../models');

exports.saveProgram = async (req, res) => {
  try {
    const { programId } = req.body;
    const userId = req.user.id;

    // Verificăm dacă programul există
    const program = await Program.findByPk(programId);
    if (!program) {
      return res.status(404).json({ message: 'Programul nu a fost găsit' });
    }

    // Verificăm dacă programul este deja salvat
    const existingSavedProgram = await SavedProgram.findOne({
      where: { userId, programId }
    });

    if (existingSavedProgram) {
      return res.status(400).json({ message: 'Programul este deja salvat' });
    }

    const savedProgram = await SavedProgram.create({
      userId,
      programId,
      savedAt: new Date()
    });

    res.status(201).json(savedProgram);
  } catch (error) {
    console.error('Eroare la salvarea programului:', error);
    res.status(500).json({ 
      message: 'Eroare la salvarea programului',
      error: error.message 
    });
  }
};

exports.getSavedPrograms = async (req, res) => {
  try {
    const userId = req.user.id;

    const savedPrograms = await SavedProgram.findAll({
      where: { userId },
      include: [{
        model: Program,
        as: 'Program',
        include: [{
          model: University,
          as: 'University',
          attributes: ['id', 'name', 'imageUrl', 'location', 'website']
        }],
        attributes: ['id', 'name', 'faculty', 'degree', 'credits', 'languages', 'description', 'duration', 'tuitionFee', 'universityId']
      }],
      order: [['savedAt', 'DESC']]
    });

    if (!savedPrograms || savedPrograms.length === 0) {
      return res.json([]);
    }

    // Transformăm rezultatul pentru a include doar informațiile necesare
    const formattedPrograms = savedPrograms.map(sp => ({
      id: sp.id,
      program: {
        id: sp.Program.id,
        name: sp.Program.name,
        faculty: sp.Program.faculty,
        degree: sp.Program.degree,
        credits: sp.Program.credits,
        languages: sp.Program.languages,
        description: sp.Program.description,
        duration: sp.Program.duration,
        tuitionFee: sp.Program.tuitionFee,
        university: {
          id: sp.Program.University.id,
          name: sp.Program.University.name,
          imageUrl: sp.Program.University.imageUrl,
          location: sp.Program.University.location,
          website: sp.Program.University.website
        }
      },
      savedAt: sp.savedAt
    }));

    res.json(formattedPrograms);
  } catch (error) {
    console.error('Eroare la obținerea programelor salvate:', error);
    res.status(500).json({ 
      message: 'Eroare la obținerea programelor salvate',
      error: error.message 
    });
  }
};

exports.removeSavedProgram = async (req, res) => {
  try {
    const { programId } = req.params;
    const userId = req.user.id;

    const savedProgram = await SavedProgram.findOne({
      where: { userId, programId }
    });

    if (!savedProgram) {
      return res.status(404).json({ message: 'Programul salvat nu a fost găsit' });
    }

    await savedProgram.destroy();
    res.json({ message: 'Programul a fost șters din lista de favorite' });
  } catch (error) {
    console.error('Eroare la ștergerea programului salvat:', error);
    res.status(500).json({ 
      message: 'Eroare la ștergerea programului salvat',
      error: error.message 
    });
  }
}; 