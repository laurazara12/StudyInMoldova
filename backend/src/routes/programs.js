const express = require('express');
const router = express.Router();
const { Program, University } = require('../models');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Obține toate programele
router.get('/', async (req, res) => {
  try {
    const programs = await Program.findAll({
      include: [{
        model: University,
        attributes: ['name', 'id']
      }]
    });
    res.json(programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ 
      message: 'Error fetching programs',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Obține programele pentru o universitate specifică
router.get('/university/:universityId', async (req, res) => {
  try {
    const programs = await Program.findAll({
      where: { universityId: req.params.universityId },
      include: [{
        model: University,
        attributes: ['name', 'id']
      }]
    });
    res.json(programs);
  } catch (error) {
    console.error('Error fetching university programs:', error);
    res.status(500).json({ 
      message: 'Error fetching university programs',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Adaugă un program nou (doar pentru admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const newProgram = await Program.create(req.body);
    res.status(201).json(newProgram);
  } catch (error) {
    console.error('Error creating program:', error);
    res.status(500).json({ 
      message: 'Error creating program',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Actualizează un program (doar pentru admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const existingProgram = await Program.findByPk(req.params.id);
    if (!existingProgram) {
      return res.status(404).json({ message: 'Program not found' });
    }
    await existingProgram.update(req.body);
    res.json(existingProgram);
  } catch (error) {
    console.error('Error updating program:', error);
    res.status(500).json({ 
      message: 'Error updating program',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Șterge un program (doar pentru admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const existingProgram = await Program.findByPk(req.params.id);
    if (!existingProgram) {
      return res.status(404).json({ message: 'Program not found' });
    }
    await existingProgram.destroy();
    res.json({ message: 'Program deleted successfully' });
  } catch (error) {
    console.error('Error deleting program:', error);
    res.status(500).json({ 
      message: 'Error deleting program',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router; 