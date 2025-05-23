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

exports.getUniversityBySlug = async (req, res) => {
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
}; 