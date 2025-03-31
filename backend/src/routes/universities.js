const express = require('express');
const router = express.Router();
const University = require('../models/university');

// GET /api/universities - Obține toate universitățile
router.get('/', async (req, res) => {
  try {
    const universities = await University.findAll();
    res.json(universities);
  } catch (error) {
    console.error('Eroare la obținerea universităților:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/universities/:id - Obține o universitate specifică
router.get('/:id', async (req, res) => {
  try {
    const university = await University.findByPk(req.params.id);
    if (university) {
      res.json(university);
    } else {
      res.status(404).json({ message: 'Universitatea nu a fost găsită' });
    }
  } catch (error) {
    console.error('Eroare la obținerea universității:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/universities - Creează o nouă universitate
router.post('/', async (req, res) => {
  try {
    const { name, description, location, imageUrl, website } = req.body;
    const university = await University.create({
      name,
      description,
      location,
      imageUrl,
      website
    });
    res.status(201).json(university);
  } catch (error) {
    console.error('Eroare la crearea universității:', error);
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/universities/:id - Actualizează o universitate
router.put('/:id', async (req, res) => {
  try {
    const university = await University.findByPk(req.params.id);
    if (!university) {
      return res.status(404).json({ message: 'Universitatea nu a fost găsită' });
    }
    await university.update(req.body);
    res.json(university);
  } catch (error) {
    console.error('Eroare la actualizarea universității:', error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/universities/:id - Șterge o universitate
router.delete('/:id', async (req, res) => {
  try {
    const university = await University.findByPk(req.params.id);
    if (!university) {
      return res.status(404).json({ message: 'Universitatea nu a fost găsită' });
    }
    await university.destroy();
    res.json({ message: 'Universitatea a fost ștearsă cu succes' });
  } catch (error) {
    console.error('Eroare la ștergerea universității:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 