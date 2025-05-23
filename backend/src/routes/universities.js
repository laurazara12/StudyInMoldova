const express = require('express');
const router = express.Router();
const { University, Program } = require('../models');
const { authMiddleware } = require('../middleware/auth');

// Rute publice
router.get('/', async (req, res) => {
  try {
    const universities = await University.findAll({
      order: [['name', 'ASC']]
    });
    res.json(universities);
  } catch (error) {
    console.error('Error getting universities:', error);
    res.status(500).json({ message: 'Error getting universities' });
  }
});

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
router.post('/', authMiddleware, async (req, res) => {
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
      image_url: req.body.image_url || req.body.imageUrl || '', // Acceptăm imaginea din request
      website: req.body.website || '',
      ranking: req.body.ranking || '',
      slug: slug,
      tuition_fees: {
        bachelor: req.body.tuition_fees?.bachelor || req.body.tuitionFees?.bachelor || null,
        master: req.body.tuition_fees?.master || req.body.tuitionFees?.master || null,
        phd: req.body.tuition_fees?.phd || req.body.tuitionFees?.phd || null
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
    
    res.status(201).json(university);
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

router.put('/:id', authMiddleware, async (req, res) => {
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

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await University.destroy({
      where: { id: req.params.id }
    });
    
    if (!deleted) {
      return res.status(404).json({ message: 'University not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting university:', error);
    res.status(500).json({ message: 'Error deleting university' });
  }
});

module.exports = router; 