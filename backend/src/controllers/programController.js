const { Program, University } = require('../models');

exports.getAllPrograms = async (req, res) => {
  try {
    console.log('Începe obținerea programelor...');
    const programs = await Program.findAll({
      include: [{
        model: University,
        as: 'university',
        attributes: ['id', 'name', 'image_url', 'location', 'website']
      }],
      attributes: [
        'id', 'name', 'description', 'duration', 'degree', 'degree_type', 
        'language', 'tuition_fees', 'credits', 'faculty',
        'university_id', 'createdAt', 'updatedAt'
      ],
      order: [['name', 'ASC']]
    });

    const formattedPrograms = programs.map(program => ({
      id: program.id,
      name: program.name,
      description: program.description,
      duration: program.duration,
      degree: program.degree,
      degree_type: program.degree_type,
      language: program.language,
      tuition_fees: program.tuition_fees,
      credits: program.credits,
      faculty: program.faculty,
      university: program.university ? {
        name: program.university.name
      } : null,
      createdAt: program.createdAt,
      updatedAt: program.updatedAt
    }));

    console.log('Programe formatate:', JSON.stringify(formattedPrograms, null, 2));

    res.json({
      success: true,
      message: 'Programele au fost preluate cu succes',
      data: formattedPrograms,
      total: programs.length
    });
  } catch (error) {
    console.error('Eroare detaliată la obținerea programelor:', error);
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
        as: 'university',
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

    const formattedProgram = {
      ...program.toJSON(),
      university: program.university ? {
        name: program.university.name
      } : null
    };

    res.json({
      success: true,
      message: 'Programul a fost găsit cu succes',
      data: formattedProgram
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
        as: 'university',
        attributes: ['id', 'name', 'image_url', 'location', 'website']
      }],
      order: [['name', 'ASC']]
    });

    const formattedPrograms = programs.map(program => ({
      ...program.toJSON(),
      university: program.university ? {
        name: program.university.name
      } : null
    }));

    res.json({
      success: true,
      message: 'Programele universității au fost preluate cu succes',
      data: formattedPrograms,
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
    const requiredFields = ['name', 'university_id'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Câmpuri obligatorii lipsă',
        missingFields: missingFields
      });
    }

    const programData = {
      name: req.body.name,
      description: req.body.description || null,
      duration: req.body.duration || null,
      degree: req.body.degree || null,
      degree_type: req.body.degree_type || null,
      language: req.body.language || null,
      tuition_fees: req.body.tuition_fees || null,
      university_id: parseInt(req.body.university_id),
      faculty: req.body.faculty || null,
      credits: req.body.credits ? parseInt(req.body.credits) : null
    };

    console.log('Date procesate pentru crearea programului:', programData);

    const program = await Program.create(programData);
    console.log('Program creat cu succes:', program.toJSON());
    
    res.status(201).json({
      success: true,
      message: 'Programul a fost creat cu succes',
      data: program
    });
  } catch (error) {
    console.error('Eroare detaliată la crearea programului:', {
      message: error.message,
      stack: error.stack,
      data: req.body
    });
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Eroare de validare',
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }
    
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Universitatea specificată nu există'
      });
    }

    res.status(500).json({ 
      success: false,
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