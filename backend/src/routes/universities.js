const express = require('express');
const router = express.Router();
const { University } = require('../models');

// GET /api/universities - Get all universities
router.get('/', async (req, res) => {
  try {
    const universities = await University.findAll();
    res.json(universities);
  } catch (error) {
    console.error('Error fetching universities:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/universities/:id - Get a specific university
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
router.post('/', async (req, res) => {
  try {
    const { 
      name, 
      type,
      description, 
      location, 
      imageUrl, 
      website,
      ranking,
      tuitionFees,
      programs,
      contactInfo
    } = req.body;
    
    const university = await University.create({
      name,
      type,
      description,
      location,
      imageUrl,
      website,
      ranking,
      tuitionFees,
      programs,
      contactInfo
    });
    res.status(201).json(university);
  } catch (error) {
    console.error('Error creating university:', error);
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/universities/:id - Update a university
router.put('/:id', async (req, res) => {
  try {
    const university = await University.findByPk(req.params.id);
    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }
    await university.update(req.body);
    res.json(university);
  } catch (error) {
    console.error('Error updating university:', error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/universities/:id - Delete a university
router.delete('/:id', async (req, res) => {
  try {
    const university = await University.findByPk(req.params.id);
    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }
    await university.destroy();
    res.json({ message: 'University deleted successfully' });
  } catch (error) {
    console.error('Error deleting university:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 