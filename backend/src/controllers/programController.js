const { Program, University } = require('../models');

exports.getAllPrograms = async (req, res) => {
  try {
    const programs = await Program.findAll({
      include: [{
        model: University,
        as: 'University',
        attributes: ['id', 'name', 'imageUrl', 'location', 'website']
      }],
      order: [['name', 'ASC']]
    });

    res.json(programs);
  } catch (error) {
    console.error('Eroare la obținerea programelor:', error);
    res.status(500).json({ 
      message: 'Eroare la obținerea programelor',
      error: error.message 
    });
  }
};

exports.getProgramById = async (req, res) => {
  try {
    const program = await Program.findByPk(req.params.id, {
      include: [{
        model: University,
        as: 'University',
        attributes: ['id', 'name', 'imageUrl', 'location', 'website']
      }]
    });

    if (!program) {
      return res.status(404).json({ message: 'Programul nu a fost găsit' });
    }

    res.json(program);
  } catch (error) {
    console.error('Eroare la obținerea programului:', error);
    res.status(500).json({ 
      message: 'Eroare la obținerea programului',
      error: error.message 
    });
  }
};

exports.getProgramsByUniversity = async (req, res) => {
  try {
    const programs = await Program.findAll({
      where: { universityId: req.params.universityId },
      include: [{
        model: University,
        as: 'University',
        attributes: ['id', 'name', 'imageUrl', 'location', 'website']
      }],
      order: [['name', 'ASC']]
    });

    res.json(programs);
  } catch (error) {
    console.error('Eroare la obținerea programelor universității:', error);
    res.status(500).json({ 
      message: 'Eroare la obținerea programelor universității',
      error: error.message 
    });
  }
};

exports.createProgram = async (req, res) => {
  try {
    const { name, faculty, degree, credits, languages, description, duration, tuitionFee, universityId } = req.body;

    if (!name || !faculty || !degree || !credits || !languages || !duration || !tuitionFee || !universityId) {
      return res.status(400).json({ message: 'Toate câmpurile sunt obligatorii' });
    }

    const now = new Date();
    const program = await Program.create({
      name,
      faculty,
      degree,
      credits,
      languages,
      description,
      duration,
      tuitionFee,
      universityId,
      createdAt: now,
      updatedAt: now
    }, {
      fields: ['name', 'faculty', 'degree', 'credits', 'languages', 'description', 'duration', 'tuitionFee', 'universityId', 'createdAt', 'updatedAt']
    });

    res.status(201).json(program);
  } catch (error) {
    console.error('Eroare la crearea programului:', error);
    res.status(500).json({ 
      message: 'Eroare la crearea programului',
      error: error.message 
    });
  }
};

exports.updateProgram = async (req, res) => {
  try {
    const program = await Program.findByPk(req.params.id);
    if (!program) {
      return res.status(404).json({ message: 'Programul nu a fost găsit' });
    }

    await program.update(req.body);
    res.json(program);
  } catch (error) {
    console.error('Eroare la actualizarea programului:', error);
    res.status(500).json({ 
      message: 'Eroare la actualizarea programului',
      error: error.message 
    });
  }
};

exports.deleteProgram = async (req, res) => {
  try {
    const program = await Program.findByPk(req.params.id);
    if (!program) {
      return res.status(404).json({ message: 'Programul nu a fost găsit' });
    }

    await program.destroy();
    res.json({ message: 'Program șters cu succes' });
  } catch (error) {
    console.error('Eroare la ștergerea programului:', error);
    res.status(500).json({ 
      message: 'Eroare la ștergerea programului',
      error: error.message 
    });
  }
}; 