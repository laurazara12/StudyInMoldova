const { SavedProgram, Program, University } = require('../models');

exports.saveProgram = async (req, res) => {
  try {
    const { program_id } = req.body;

    if (!program_id) {
      return res.status(400).json({
        success: false,
        message: 'Program ID is required',
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
        message: 'Program is already saved',
        data: null
      });
    }

    res.json({
      success: true,
      message: 'Program saved successfully',
      data: savedProgram
    });
  } catch (error) {
    console.error('Error saving program:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error saving program',
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
      message: 'Saved programs retrieved successfully',
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
    console.error('Error getting saved programs:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error getting saved programs',
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
        message: 'Program not found in saved programs list',
        data: null
      });
    }

    res.json({
      success: true,
      message: 'Program removed from saved programs list',
      data: null
    });
  } catch (error) {
    console.error('Error removing program from saved programs list:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error removing program from saved programs list',
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
      message: 'Program saved status checked successfully'
    });
  } catch (error) {
    console.error('Error checking saved program status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error checking saved program status',
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
        message: 'program_ids must be an array',
        data: null
      });
    }

    // Check if all programs exist
    const programs = await Program.findAll({
      where: { id: program_ids }
    });

    if (programs.length !== program_ids.length) {
      return res.status(404).json({ 
        success: false,
        message: 'Some programs were not found',
        data: null
      });
    }

    // Check already saved programs
    const existingSavedPrograms = await SavedProgram.findAll({
      where: { 
        user_id: req.user.id,
        program_id: program_ids
      }
    });

    const existingProgramIds = existingSavedPrograms.map(sp => sp.program_id);
    const newProgramIds = program_ids.filter(id => !existingProgramIds.includes(id));

    // Save new programs
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
      message: 'Programs saved successfully'
    });
  } catch (error) {
    console.error('Error saving programs:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error saving programs',
      error: error.message,
      data: null
    });
  }
}; 