const { Program, University } = require('../models');

exports.getAllPrograms = async (req, res) => {
  try {
    console.log('Începe obținerea programelor...');
    
    const programs = await Program.findAll({
      include: [{
        model: University,
        as: 'University',
        attributes: ['id', 'name', 'image_url', 'location', 'website']
      }],
      order: [['name', 'ASC']]
    });

    console.log(`S-au găsit ${programs.length} programe`);
    console.log('Primele programe:', programs.slice(0, 2));

    if (!Array.isArray(programs)) {
      throw new Error('Rezultatul nu este un array');
    }

    res.json({
      success: true,
      message: 'Programele au fost preluate cu succes',
      data: programs,
      total: programs.length
    });
  } catch (error) {
    console.error('Eroare detaliată la obținerea programelor:', {
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({ 
      success: false,
      message: 'Eroare la obținerea programelor',
      error: error.message,
      data: [],
      total: 0
    });
  }
};

exports.getProgramById = async (req, res) => {
  try {
    const program = await Program.findByPk(req.params.id, {
      include: [{
        model: University,
        as: 'University',
        attributes: ['id', 'name', 'image_url', 'location', 'website']
      }]
    });

    if (!program) {
      return res.status(404).json({ 
        success: false,
        message: 'Programul nu a fost găsit',
        data: null
      });
    }

    res.json({
      success: true,
      message: 'Programul a fost preluat cu succes',
      data: program
    });
  } catch (error) {
    console.error('Eroare la obținerea programului:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la obținerea programului',
      error: error.message,
      data: null
    });
  }
};

exports.getProgramsByUniversity = async (req, res) => {
  try {
    const programs = await Program.findAll({
      where: { university_id: req.params.universityId },
      include: [{
        model: University,
        as: 'University',
        attributes: ['id', 'name', 'image_url', 'location', 'website']
      }],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      message: 'Programele universității au fost preluate cu succes',
      data: programs,
      total: programs.length
    });
  } catch (error) {
    console.error('Eroare la obținerea programelor universității:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la obținerea programelor universității',
      error: error.message,
      data: [],
      total: 0
    });
  }
};

exports.createProgram = async (req, res) => {
  try {
    const { name, faculty, degree, credits, languages, description, duration, tuitionFee, universityId } = req.body;

    if (!name || !faculty || !degree || !credits || !languages || !duration || !tuitionFee || !universityId) {
      return res.status(400).json({ 
        success: false,
        message: 'Toate câmpurile sunt obligatorii',
        data: null
      });
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

    res.status(201).json({
      success: true,
      message: 'Programul a fost creat cu succes',
      data: program
    });
  } catch (error) {
    console.error('Eroare la crearea programului:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la crearea programului',
      error: error.message,
      data: null
    });
  }
};

exports.updateProgram = async (req, res) => {
  try {
    const program = await Program.findByPk(req.params.id);
    if (!program) {
      return res.status(404).json({ 
        success: false,
        message: 'Programul nu a fost găsit',
        data: null
      });
    }

    await program.update(req.body);
    res.json({
      success: true,
      message: 'Programul a fost actualizat cu succes',
      data: program
    });
  } catch (error) {
    console.error('Eroare la actualizarea programului:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la actualizarea programului',
      error: error.message,
      data: null
    });
  }
};

exports.deleteProgram = async (req, res) => {
  try {
    const program = await Program.findByPk(req.params.id);
    if (!program) {
      return res.status(404).json({ 
        success: false,
        message: 'Programul nu a fost găsit',
        data: null
      });
    }

    await program.destroy();
    res.json({ 
      success: true,
      message: 'Program șters cu succes',
      data: null
    });
  } catch (error) {
    console.error('Eroare la ștergerea programului:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la ștergerea programului',
      error: error.message,
      data: null
    });
  }
}; 