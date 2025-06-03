const express = require('express');
const router = express.Router();
const { University, Program } = require('../models');
const { auth, adminAuth } = require('../middleware/auth');
const universityController = require('../controllers/universityController');

// Rute publice
router.get('/', universityController.getAllUniversities);

// Ruta pentru obținerea programelor unei universități
router.get('/:universityId/programs', async (req, res) => {
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
});

router.get('/:slug', async (req, res) => {
  try {
    const university = await University.findOne({
      where: { slug: req.params.slug }
    });
    
    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }
    
    res.json(university);
  } catch (error) {
    console.error('Error getting university:', error);
    res.status(500).json({ message: 'Error getting university' });
  }
});

// Rute protejate
router.post('/', auth, async (req, res) => {
  try {
    console.log('=== Începere creare universitate ===');
    console.log('Received university creation request:', JSON.stringify(req.body, null, 2));

    // Validăm datele obligatorii
    const requiredFields = ['name', 'type', 'location'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({ 
        message: 'Missing required fields', 
        fields: missingFields 
      });
    }

    // Generăm slug-ul din numele universității
    const slug = req.body.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    console.log('Generated slug:', slug);

    // Verificăm dacă există deja o universitate cu același slug
    const existingUniversity = await University.findOne({ where: { slug } });
    if (existingUniversity) {
      console.log('University with this slug already exists:', slug);
      return res.status(400).json({ 
        message: 'A university with this name already exists' 
      });
    }

    // Pregătim datele pentru creare
    const universityData = {
      name: req.body.name,
      type: req.body.type,
      description: req.body.description || '',
      location: req.body.location,
      image_url: req.body.image_url || req.body.imageUrl || '',
      website: req.body.website || '',
      ranking: req.body.ranking || '',
      slug: slug,
      tuition_fees: {
        bachelor: req.body.tuitionFees?.bachelor || '',
        master: req.body.tuitionFees?.master || '',
        phd: req.body.tuitionFees?.phd || ''
      },
      contact_info: {
        email: req.body.contactInfo?.email || null,
        phone: req.body.contactInfo?.phone || null,
        address: req.body.contactInfo?.address || null
      }
    };

    console.log('Prepared university data:', JSON.stringify(universityData, null, 2));

    // Creăm universitatea
    const university = await University.create(universityData);
    console.log('University created successfully:', JSON.stringify(university, null, 2));
    
    res.status(201).json({
      success: true,
      data: university,
      message: 'University created successfully'
    });
  } catch (error) {
    console.error('Error creating university:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      errors: error.errors
    });
    res.status(500).json({ 
      message: 'Error creating university',
      error: error.message,
      details: error.errors
    });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const [updated] = await University.update(req.body, {
      where: { id: req.params.id }
    });
    
    if (!updated) {
      return res.status(404).json({ message: 'University not found' });
    }
    
    const updatedUniversity = await University.findByPk(req.params.id);
    res.json(updatedUniversity);
  } catch (error) {
    console.error('Error updating university:', error);
    res.status(500).json({ message: 'Error updating university' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const university = await University.findByPk(req.params.id, {
      include: [{
        model: Program,
        as: 'programs'
      }]
    });
    
    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }

    // Delete all associated programs first
    if (university.programs && university.programs.length > 0) {
      await Promise.all(university.programs.map(program => program.destroy()));
    }

    // Then delete the university
    await university.destroy();
    
    res.json({
      success: true,
      message: 'University and associated programs were successfully deleted'
    });
  } catch (error) {
    console.error('Error deleting university:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting university',
      error: error.message
    });
  }
});

module.exports = router; 