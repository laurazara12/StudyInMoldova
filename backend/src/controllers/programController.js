const { Program, University } = require('../models');

exports.getAllPrograms = async (req, res) => {
  try {
    console.log('Starting to get programs...');
    const programs = await Program.findAll({
      include: [{
        model: University,
        as: 'university',
        attributes: ['id', 'name', 'image_url', 'location', 'website']
      }],
      attributes: [
        'id', 'name', 'description', 'duration', 'degree', 'degree_type', 
        'language', 'tuition_fees', 'credits', 'faculty', 'start_date', 'application_deadline',
        'university_id', 'createdAt', 'updatedAt'
      ],
      order: [['name', 'ASC']]
    });

    const formattedPrograms = programs.map(program => {
      return {
        id: program.id,
        name: program.name || 'N/A',
        description: program.description || 'N/A',
        duration: program.duration || 'N/A',
        degree: program.degree || 'N/A',
        degree_type: program.degree_type || 'N/A',
        language: program.language || 'N/A',
        tuition_fees: program.tuition_fees || 'N/A',
        credits: program.credits || 'N/A',
        faculty: program.faculty || 'N/A',
        start_date: program.start_date || 'N/A',
        application_deadline: program.application_deadline || 'N/A',
        university: program.university ? {
          id: program.university.id,
          name: program.university.name || 'N/A',
          location: program.university.location || 'N/A',
          website: program.university.website || 'N/A'
        } : null
      };
    });

    console.log('Formatted programs:', JSON.stringify(formattedPrograms, null, 2));

    res.json({
      success: true,
      message: 'Programs retrieved successfully',
      data: formattedPrograms,
      total: programs.length
    });
  } catch (error) {
    console.error('Detailed error getting programs:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error getting programs', 
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
        message: 'Program not found',
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
      message: 'Program found successfully',
      data: formattedProgram
    });
  } catch (error) {
    console.error('Error getting program:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error getting program',
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
      message: 'University programs retrieved successfully',
      data: formattedPrograms,
      total: programs.length
    });
  } catch (error) {
    console.error('Error getting university programs:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error getting university programs',
      error: error.message,
      data: [],
      total: 0
    });
  }
};

exports.createProgram = async (req, res) => {
  try {
    console.log('Received data for program creation:', req.body);
    
    // Check required fields
    const requiredFields = ['name', 'university_id'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Missing required fields',
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
      credits: req.body.credits ? parseInt(req.body.credits) : null,
      start_date: req.body.start_date || null,
      application_deadline: req.body.application_deadline || null
    };

    console.log('Processed data for program creation:', programData);

    const program = await Program.create(programData);
    console.log('Program created successfully:', program.toJSON());
    
    res.status(201).json({
      success: true,
      message: 'Program created successfully',
      data: program
    });
  } catch (error) {
    console.error('Detailed error creating program:', {
      message: error.message,
      stack: error.stack,
      data: req.body
    });
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }
    
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'The specified university does not exist'
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Error creating program',
      error: error.message
    });
  }
};

exports.updateProgram = async (req, res) => {
  try {
    console.log('Received data for update:', req.body);
    
    const program = await Program.findByPk(req.params.id);
    if (!program) {
      return res.status(404).json({ 
        success: false,
        message: 'Program not found' 
      });
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
      credits: req.body.credits,
      start_date: req.body.start_date,
      application_deadline: req.body.application_deadline
    };

    console.log('Processed data for update:', programData);

    await program.update(programData);

    // Get updated program with all relationships
    const updatedProgram = await Program.findByPk(program.id, {
      include: [{
        model: University,
        as: 'university',
        attributes: ['id', 'name', 'location', 'website']
      }]
    });

    // Format data for response
    const formattedProgram = {
      id: updatedProgram.id,
      name: updatedProgram.name || 'N/A',
      description: updatedProgram.description || 'N/A',
      duration: updatedProgram.duration || 'N/A',
      degree: updatedProgram.degree || 'N/A',
      degree_type: updatedProgram.degree_type || 'N/A',
      language: updatedProgram.language || 'N/A',
      tuition_fees: updatedProgram.tuition_fees || 'N/A',
      credits: updatedProgram.credits ? `${updatedProgram.credits} credits` : 'N/A',
      faculty: updatedProgram.faculty || 'N/A',
      start_date: updatedProgram.start_date || 'N/A',
      application_deadline: updatedProgram.application_deadline || 'N/A',
      university: updatedProgram.university ? {
        id: updatedProgram.university.id,
        name: updatedProgram.university.name || 'N/A',
        location: updatedProgram.university.location || 'N/A',
        website: updatedProgram.university.website || 'N/A'
      } : {
        name: 'N/A',
        location: 'N/A',
        website: 'N/A'
      }
    };

    res.json({
      success: true,
      message: 'Program updated successfully',
      data: formattedProgram
    });
  } catch (error) {
    console.error('Error updating program:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating program', 
      error: error.message 
    });
  }
};

exports.deleteProgram = async (req, res) => {
  try {
    const program = await Program.findByPk(req.params.id);
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    await program.destroy();
    res.json({ message: 'Program deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting program', error: error.message });
  }
}; 