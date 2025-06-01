const { Scholarship, User } = require('../models');

exports.getAllScholarships = async (req, res) => {
  try {
    const scholarships = await Scholarship.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });
    res.json({
      success: true,
      message: 'Scholarships retrieved successfully',
      data: scholarships,
      total: scholarships.length
    });
  } catch (error) {
    console.error('Error getting scholarships:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error getting scholarships',
      error: error.message,
      data: [],
      total: 0
    });
  }
};

exports.getScholarshipById = async (req, res) => {
  try {
    const scholarship = await Scholarship.findByPk(req.params.id);
    
    if (!scholarship) {
      return res.status(404).json({ 
        success: false,
        message: 'Scholarship not found',
        data: null
      });
    }
    
    res.json({
      success: true,
      message: 'Scholarship retrieved successfully',
      data: scholarship
    });
  } catch (error) {
    console.error('Error getting scholarship:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error getting scholarship',
      error: error.message,
      data: null
    });
  }
};

exports.createScholarship = async (req, res) => {
  try {
    const { name, description, amount, requirements, deadline } = req.body;
    
    const scholarship = await Scholarship.create({
      name,
      description,
      amount,
      requirements,
      deadline,
      isActive: true
    });
    
    res.status(201).json({
      success: true,
      message: 'Scholarship created successfully',
      data: scholarship
    });
  } catch (error) {
    console.error('Error creating scholarship:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating scholarship',
      error: error.message,
      data: null
    });
  }
};

exports.updateScholarship = async (req, res) => {
  try {
    const { name, description, amount, requirements, deadline, isActive } = req.body;
    const scholarship = await Scholarship.findByPk(req.params.id);
    
    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }
    
    scholarship.name = name || scholarship.name;
    scholarship.description = description || scholarship.description;
    scholarship.amount = amount || scholarship.amount;
    scholarship.requirements = requirements || scholarship.requirements;
    scholarship.deadline = deadline || scholarship.deadline;
    scholarship.isActive = isActive !== undefined ? isActive : scholarship.isActive;
    
    await scholarship.save();
    
    res.json(scholarship);
  } catch (error) {
    console.error('Error updating scholarship:', error);
    res.status(500).json({ message: 'Error updating scholarship' });
  }
};

exports.deleteScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findByPk(req.params.id);
    
    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }
    
    await scholarship.destroy();
    res.json({ message: 'Scholarship deleted successfully' });
  } catch (error) {
    console.error('Error deleting scholarship:', error);
    res.status(500).json({ message: 'Error deleting scholarship' });
  }
};

exports.applyForScholarship = async (req, res) => {
  try {
    const { scholarshipId } = req.body;
    const userId = req.user.userId;

    const scholarship = await Scholarship.findByPk(scholarshipId);
    if (!scholarship) {
      return res.status(404).json({ 
        success: false,
        message: 'Scholarship not found',
        data: null
      });
    }

    if (!scholarship.isActive) {
      return res.status(400).json({ 
        success: false,
        message: 'Scholarship is no longer active',
        data: null
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found',
        data: null
      });
    }

    // Check if user has already applied for this scholarship
    const existingApplication = await user.hasScholarship(scholarship);
    if (existingApplication) {
      return res.status(400).json({ 
        success: false,
        message: 'You have already applied for this scholarship',
        data: null
      });
    }

    // Add scholarship to user
    await user.addScholarship(scholarship);

    res.json({ 
      success: true,
      message: 'Scholarship application submitted successfully',
      data: null
    });
  } catch (error) {
    console.error('Error applying for scholarship:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error applying for scholarship',
      error: error.message,
      data: null
    });
  }
}; 