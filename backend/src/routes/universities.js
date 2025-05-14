const express = require('express');
const router = express.Router();
const { University } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// GET /api/universities - Get all universities
router.get('/', async (req, res) => {
  try {
    const universities = await University.findAll();
    res.json(universities);
  } catch (error) {
    console.error('Eroare la obținerea universităților:', error);
    res.status(500).json({ message: 'Eroare la obținerea universităților' });
  }
});

// GET /api/universities/slug/:slug - Get university by slug
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

// GET /api/universities/:id - Get a specific university by ID
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

// POST /api/universities - Create a new university
router.post('/', authMiddleware, async (req, res) => {
  try {
    const university = await University.create(req.body);
    res.status(201).json(university);
  } catch (error) {
    console.error('Eroare la crearea universității:', error);
    res.status(500).json({ message: 'Eroare la crearea universității' });
  }
});

// PUT /api/universities/:id - Update a university
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const university = await University.findByPk(req.params.id);
    if (!university) {
      return res.status(404).json({ message: 'Universitatea nu a fost găsită' });
    }
    await university.update(req.body);
    res.json(university);
  } catch (error) {
    console.error('Eroare la actualizarea universității:', error);
    res.status(500).json({ message: 'Eroare la actualizarea universității' });
  }
});

// DELETE /api/universities/:id - Delete a university
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const university = await University.findByPk(req.params.id);
    if (!university) {
      return res.status(404).json({ message: 'Universitatea nu a fost găsită' });
    }
    await university.destroy();
    res.json({ message: 'Universitatea a fost ștearsă cu succes' });
  } catch (error) {
    console.error('Eroare la ștergerea universității:', error);
    res.status(500).json({ message: 'Eroare la ștergerea universității' });
  }
});

module.exports = router; 