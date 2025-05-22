const { University } = require('../models');

exports.getAllUniversities = async (req, res) => {
  try {
    const universities = await University.findAll({
      order: [['name', 'ASC']]
    });
    
    res.json(universities);
  } catch (error) {
    console.error('Error getting universities:', error);
    res.status(500).json({ message: 'Error getting universities' });
  }
};

exports.getUniversityById = async (req, res) => {
  try {
    const university = await University.findByPk(req.params.id);
    
    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }
    
    res.json(university);
  } catch (error) {
    console.error('Error getting university:', error);
    res.status(500).json({ message: 'Error getting university' });
  }
};

exports.createUniversity = async (req, res) => {
  try {
    const university = await University.create(req.body);
    res.status(201).json(university);
  } catch (error) {
    console.error('Error creating university:', error);
    res.status(500).json({ message: 'Error creating university' });
  }
};

exports.updateUniversity = async (req, res) => {
  try {
    console.log('Received update request with body:', JSON.stringify(req.body, null, 2));
    
    // Pregătim datele pentru actualizare
    const updateData = {
      name: req.body.name,
      type: req.body.type,
      description: req.body.description,
      location: req.body.location,
      image_url: req.body.image_url,
      website: req.body.website,
      ranking: req.body.ranking,
      tuition_fees: req.body.tuition_fees || {
        bachelor: null,
        master: null,
        phd: null
      },
      contact_info: req.body.contact_info || {
        email: null,
        phone: null,
        address: null
      }
    };

    console.log('Data prepared for update:', JSON.stringify(updateData, null, 2));

    const [updated] = await University.update(updateData, {
      where: { id: req.params.id }
    });
    
    if (!updated) {
      return res.status(404).json({ message: 'University not found' });
    }
    
    const updatedUniversity = await University.findByPk(req.params.id);
    console.log('Updated university data:', JSON.stringify(updatedUniversity, null, 2));
    
    // Asigurăm că răspunsul include taxele de studii în formatul corect
    const responseData = {
      ...updatedUniversity.toJSON(),
      tuition_fees: updatedUniversity.tuition_fees || {
        bachelor: null,
        master: null,
        phd: null
      }
    };
    
    res.json(responseData);
  } catch (error) {
    console.error('Error updating university:', error);
    res.status(500).json({ message: 'Error updating university' });
  }
};

exports.deleteUniversity = async (req, res) => {
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
}; 