const { University } = require('../models');

exports.getAllUniversities = async (req, res) => {
  try {
    console.log('=== Starting to fetch universities ===');
    
    const universities = await University.findAll({
      order: [['name', 'ASC']]
    });
    
    console.log('Universities found:', universities.length);
    
    // Process data to ensure correct format
    const processedUniversities = universities.map(uni => {
      const universityData = uni.toJSON();
      
      // Process tuition fees
      const tuitionFees = universityData.tuition_fees || {};
      const processedFees = {
        bachelor: tuitionFees.bachelor ? parseFloat(tuitionFees.bachelor) : null,
        master: tuitionFees.master ? parseFloat(tuitionFees.master) : null,
        phd: tuitionFees.phd ? parseFloat(tuitionFees.phd) : null
      };
      
      // Process contact information
      const contactInfo = universityData.contact_info || {};
      const processedContact = {
        email: contactInfo.email || null,
        phone: contactInfo.phone || null,
        address: contactInfo.address || null
      };
      
      return {
        ...universityData,
        type: universityData.type || 'Public',
        location: universityData.location || 'Chișinău',
        ranking: universityData.ranking || '',
        tuition_fees: processedFees,
        contact_info: processedContact
      };
    });
    
    console.log('Processed universities:', processedUniversities.length);
    
    res.json({
      success: true,
      data: processedUniversities,
      message: 'Universities retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching universities:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching universities',
      error: error.message
    });
  }
};

exports.getUniversityById = async (req, res) => {
  try {
    const university = await University.findByPk(req.params.id);
    
    if (!university) {
      return res.status(404).json({ 
        success: false,
        message: 'University not found'
      });
    }
    
    res.json({
      success: true,
      data: university,
      message: 'University retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting university:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error retrieving university',
      error: error.message
    });
  }
};

exports.createUniversity = async (req, res) => {
  try {
    console.log('=== Starting university creation ===');
    console.log('Received university creation request:', JSON.stringify(req.body, null, 2));

    const requiredFields = ['name', 'type', 'location'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields',
        fields: missingFields 
      });
    }

    const slug = req.body.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    console.log('Generated slug:', slug);

    const existingUniversity = await University.findOne({ where: { slug } });
    if (existingUniversity) {
      console.log('University with this slug already exists:', slug);
      return res.status(400).json({ 
        success: false,
        message: 'A university with this name already exists'
      });
    }

    const universityData = {
      name: req.body.name,
      type: req.body.type,
      description: req.body.description || '',
      location: req.body.location,
      image_url: req.body.imageUrl || '',
      website: req.body.website || '',
      ranking: req.body.ranking || '',
      slug: slug,
      tuition_fees: {
        bachelor: req.body.tuitionFees?.bachelor || null,
        master: req.body.tuitionFees?.master || null,
        phd: req.body.tuitionFees?.phd || null
      },
      contact_info: {
        email: req.body.contactInfo?.email || null,
        phone: req.body.contactInfo?.phone || null,
        address: req.body.contactInfo?.address || null
      }
    };

    console.log('Prepared university data:', JSON.stringify(universityData, null, 2));

    const university = await University.create(universityData);
    console.log('University created successfully:', JSON.stringify(university, null, 2));
    
    res.status(201).json({
      success: true,
      data: university,
      message: 'University created successfully'
    });
  } catch (error) {
    console.error('Error creating university:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating university',
      error: error.message,
      details: error.errors
    });
  }
};

exports.updateUniversity = async (req, res) => {
  try {
    console.log('Received update request with body:', JSON.stringify(req.body, null, 2));
    
    // Check if university exists
    const existingUniversity = await University.findByPk(req.params.id);
    if (!existingUniversity) {
      return res.status(404).json({ 
        success: false,
        message: 'University not found'
      });
    }

    // Prepare data for update
    const updateData = {
      name: req.body.name,
      type: req.body.type,
      description: req.body.description || '',
      location: req.body.location,
      image_url: req.body.image_url || '',
      website: req.body.website || '',
      ranking: req.body.ranking ? parseInt(req.body.ranking) : null,
      tuition_fees: {
        bachelor: req.body.tuition_fees?.bachelor ? parseFloat(req.body.tuition_fees.bachelor) : null,
        master: req.body.tuition_fees?.master ? parseFloat(req.body.tuition_fees.master) : null,
        phd: req.body.tuition_fees?.phd ? parseFloat(req.body.tuition_fees.phd) : null
      },
      contact_info: {
        email: req.body.contact_info?.email || null,
        phone: req.body.contact_info?.phone || null,
        address: req.body.contact_info?.address || null
      }
    };

    console.log('Data prepared for update:', JSON.stringify(updateData, null, 2));

    try {
      // Update university
      await existingUniversity.update(updateData);
      
      // Reload updated data
      const updatedUniversity = await University.findByPk(req.params.id);
      console.log('Updated university data:', JSON.stringify(updatedUniversity, null, 2));
      
      return res.json({
        success: true,
        data: updatedUniversity,
        message: 'University updated successfully'
      });
    } catch (updateError) {
      console.error('Error during university update:', updateError);
      return res.status(400).json({
        success: false,
        message: 'Error updating university data',
        error: updateError.message,
        details: updateError.errors
      });
    }
  } catch (error) {
    console.error('Error in updateUniversity:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error updating university',
      error: error.message,
      details: error.errors
    });
  }
};

exports.deleteUniversity = async (req, res) => {
  try {
    const deleted = await University.destroy({
      where: { id: req.params.id }
    });
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false,
        message: 'University not found'
      });
    }
    
    res.json({
      success: true,
      message: 'University deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting university:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting university',
      error: error.message
    });
  }
};

exports.getUniversityBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    console.log('Searching for university with slug:', slug);
    
    const university = await University.findOne({
      where: { slug: slug.toLowerCase() }
    });

    if (!university) {
      console.log('University not found for slug:', slug);
      return res.status(404).json({ 
        success: false,
        message: 'University not found',
        slug: slug
      });
    }

    console.log('University found:', {
      id: university.id,
      name: university.name,
      slug: university.slug
    });

    res.json({
      success: true,
      data: university,
      message: 'University retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting university:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error retrieving university',
      error: error.message
    });
  }
}; 