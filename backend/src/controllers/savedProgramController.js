const { SavedProgram, Program, University } = require('../models');

exports.saveProgram = async (req, res) => {
  try {
    const { program_id } = req.body;

    if (!program_id) {
      return res.status(400).json({
        success: false,
        message: 'ID-ul programului este obligatoriu',
        data: null
      });
    }

    const [savedProgram, created] = await SavedProgram.findOrCreate({
      where: {
        user_id: req.user.id,
        program_id: program_id
      },
      defaults: {
        saved_at: new Date()
      }
    });

    if (!created) {
      return res.status(400).json({
        success: false,
        message: 'Programul este deja salvat',
        data: null
      });
    }

    res.json({
      success: true,
      message: 'Programul a fost salvat cu succes',
      data: savedProgram
    });
  } catch (error) {
    console.error('Eroare la salvarea programului:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la salvarea programului',
      error: error.message,
      data: null
    });
  }
};

exports.getSavedPrograms = async (req, res) => {
  try {
    const savedPrograms = await SavedProgram.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: Program,
        as: 'program',
        attributes: [
          'id',
          'name',
          'description',
          'duration',
          'degree_type',
          'language',
          'tuition_fees',
          'faculty',
          'credits'
        ],
        include: [{
          model: University,
          as: 'university',
          attributes: ['id', 'name', 'image_url', 'location', 'website']
        }]
      }],
      order: [['saved_at', 'DESC']]
    });

    res.json({
      success: true,
      message: 'Programele salvate au fost preluate cu succes',
      data: savedPrograms.map(sp => ({
        id: sp.program.id,
        name: sp.program.name,
        description: sp.program.description,
        duration: sp.program.duration,
        degree_type: sp.program.degree_type,
        language: sp.program.language,
        tuition_fees: sp.program.tuition_fees,
        faculty: sp.program.faculty,
        credits: sp.program.credits,
        university: sp.program.university
      })),
      total: savedPrograms.length
    });
  } catch (error) {
    console.error('Eroare la obținerea programelor salvate:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la obținerea programelor salvate',
      error: error.message,
      data: [],
      total: 0
    });
  }
};

exports.unsaveProgram = async (req, res) => {
  try {
    const { program_id } = req.params;

    const deleted = await SavedProgram.destroy({
      where: {
        user_id: req.user.id,
        program_id: program_id
      }
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Programul nu a fost găsit în lista de programe salvate',
        data: null
      });
    }

    res.json({
      success: true,
      message: 'Programul a fost eliminat din lista de programe salvate',
      data: null
    });
  } catch (error) {
    console.error('Eroare la eliminarea programului din lista de programe salvate:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la eliminarea programului din lista de programe salvate',
      error: error.message,
      data: null
    });
  }
};

exports.checkIfProgramSaved = async (req, res) => {
  try {
    const { program_id } = req.params;

    const savedProgram = await SavedProgram.findOne({
      where: { 
        user_id: req.user.id,
        program_id: program_id
      }
    });

    res.json({ 
      success: true,
      data: { isSaved: !!savedProgram },
      message: 'Verificare program salvat realizată cu succes'
    });
  } catch (error) {
    console.error('Eroare la verificarea programului salvat:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la verificarea programului salvat',
      error: error.message,
      data: null
    });
  }
};

exports.saveMultiplePrograms = async (req, res) => {
  try {
    const { program_ids } = req.body;

    if (!Array.isArray(program_ids)) {
      return res.status(400).json({ 
        success: false,
        message: 'program_ids trebuie să fie un array',
        data: null
      });
    }

    // Verificăm dacă toate programele există
    const programs = await Program.findAll({
      where: { id: program_ids }
    });

    if (programs.length !== program_ids.length) {
      return res.status(404).json({ 
        success: false,
        message: 'Unele programe nu au fost găsite',
        data: null
      });
    }

    // Verificăm programele deja salvate
    const existingSavedPrograms = await SavedProgram.findAll({
      where: { 
        user_id: req.user.id,
        program_id: program_ids
      }
    });

    const existingProgramIds = existingSavedPrograms.map(sp => sp.program_id);
    const newProgramIds = program_ids.filter(id => !existingProgramIds.includes(id));

    // Salvăm noile programe
    const savedPrograms = await Promise.all(
      newProgramIds.map(program_id => 
        SavedProgram.create({
          user_id: req.user.id,
          program_id,
          saved_at: new Date()
        })
      )
    );

    res.status(201).json({
      success: true,
      data: {
        savedCount: savedPrograms.length,
        alreadySavedCount: existingSavedPrograms.length,
        savedPrograms
      },
      message: 'Programe salvate cu succes'
    });
  } catch (error) {
    console.error('Eroare la salvarea programelor:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la salvarea programelor',
      error: error.message,
      data: null
    });
  }
}; 