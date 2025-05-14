const express = require('express');
const router = express.Router();
const { University } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Rute publice
router.get('/', async (req, res) => {
  try {
    const universities = await University.findAll({
      order: [['name', 'ASC']]
    });
    res.json(universities);
  } catch (error) {
    console.error('Eroare la obținerea universităților:', error);
    res.status(500).json({ message: 'Eroare la obținerea universităților' });
  }
});

router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    console.log('Căutăm universitatea cu slug-ul:', slug);
    
    const university = await University.findOne({
      where: { slug: slug.toLowerCase() }
    });

    if (!university) {
      console.log('Universitatea nu a fost găsită pentru slug-ul:', slug);
      return res.status(404).json({ 
        message: 'Universitatea nu a fost găsită',
        slug: slug
      });
    }

    console.log('Universitatea găsită:', {
      id: university.id,
      name: university.name,
      slug: university.slug
    });

    res.json(university);
  } catch (error) {
    console.error('Eroare la obținerea universității:', error);
    res.status(500).json({ 
      message: 'Eroare la obținerea universității',
      error: error.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const university = await University.findByPk(req.params.id);
    if (university) {
      res.json(university);
    } else {
      res.status(404).json({ message: 'University not found' });
    }
  } catch (error) {
    console.error('Error fetching university:', error);
    res.status(500).json({ message: error.message });
  }
});

// Rute protejate (necesită autentificare)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const university = await University.create(req.body);
    res.status(201).json(university);
  } catch (error) {
    console.error('Error creating university:', error);
    res.status(500).json({ message: 'Error creating university' });
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
    
    res.json({ message: 'University deleted successfully' });
  } catch (error) {
    console.error('Error deleting university:', error);
    res.status(500).json({ message: 'Error deleting university' });
  }
});

module.exports = router; 