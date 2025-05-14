const { Program, University } = require('../models');

exports.getAllPrograms = async (req, res) => {
  try {
    console.log('Începe obținerea programelor...');
    const programs = await Program.findAll({
      include: [{
        model: University,
        as: 'University',
        attributes: ['id', 'name']
      }],
      attributes: [
        'id', 'name', 'description', 'duration', 'degree_type', 
        'language', 'tuition_fees', 'credits', 'faculty',
        'university_id', 'createdAt', 'updatedAt'
      ]
    });
    res.json(programs);
  } catch (error) {
    console.error('Eroare detaliată la obținerea programelor:', error);
    res.status(500).json({ message: 'Eroare la obținerea programelor', error: error.message });
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
      message: 'Programul a fost găsit cu succes',
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
    console.log('Date primite pentru crearea programului:', req.body);
    
    // Verificăm câmpurile obligatorii
    const requiredFields = ['name', 'description', 'duration', 'degree_type', 'language', 'tuition_fees', 'university_id'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Câmpuri obligatorii lipsă',
        missingFields: missingFields
      });
    }

    const programData = {
      name: req.body.name,
      description: req.body.description,
      duration: parseInt(req.body.duration),
      degree_type: req.body.degree_type,
      language: req.body.language,
      tuition_fees: req.body.tuition_fees,
      university_id: parseInt(req.body.university_id),
      faculty: req.body.faculty || null,
      credits: req.body.credits ? parseInt(req.body.credits) : null
    };

    console.log('Date procesate pentru crearea programului:', programData);

    const program = await Program.create(programData);
    console.log('Program creat cu succes:', program.toJSON());
    
    res.status(201).json(program);
  } catch (error) {
    console.error('Eroare detaliată la crearea programului:', {
      message: error.message,
      stack: error.stack,
      data: req.body
    });
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Eroare de validare',
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }
    
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        message: 'Universitatea specificată nu există'
      });
    }

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

    const programData = {
      name: req.body.name,
      description: req.body.description,
      duration: req.body.duration,
      degree_type: req.body.degree_type,
      language: req.body.language,
      tuition_fees: req.body.tuition_fees,
      university_id: req.body.university_id,
      faculty: req.body.faculty,
      credits: req.body.credits
    };

    await program.update(programData);
    res.json(program);
  } catch (error) {
    res.status(500).json({ message: 'Eroare la actualizarea programului', error: error.message });
  }
};

exports.deleteProgram = async (req, res) => {
  try {
    const program = await Program.findByPk(req.params.id);
    if (!program) {
      return res.status(404).json({ message: 'Programul nu a fost găsit' });
    }
    await program.destroy();
    res.json({ message: 'Programul a fost șters cu succes' });
  } catch (error) {
    res.status(500).json({ message: 'Eroare la ștergerea programului', error: error.message });
  }
}; 