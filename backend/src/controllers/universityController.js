const { University } = require('../models');

exports.getAllUniversities = async (req, res) => {
  try {
    console.log('=== Începe preluarea universităților ===');
    
    const universities = await University.findAll({
      order: [['name', 'ASC']]
    });
    
    console.log('Universități găsite:', universities.length);
    
    // Procesăm datele pentru a ne asigura că au formatul corect
    const processedUniversities = universities.map(uni => {
      const universityData = uni.toJSON();
      
      // Procesăm taxele de școlarizare
      const tuitionFees = universityData.tuition_fees || {};
      const processedFees = {
        bachelor: tuitionFees.bachelor ? parseFloat(tuitionFees.bachelor) : null,
        master: tuitionFees.master ? parseFloat(tuitionFees.master) : null,
        phd: tuitionFees.phd ? parseFloat(tuitionFees.phd) : null
      };
      
      // Procesăm informațiile de contact
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
    
    console.log('Universități procesate:', processedUniversities.length);
    
    res.json({
      success: true,
      data: processedUniversities,
      message: 'Universitățile au fost preluate cu succes'
    });
  } catch (error) {
    console.error('Eroare la preluarea universităților:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la preluarea universităților',
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
        message: 'Universitatea nu a fost găsită'
      });
    }
    
    res.json({
      success: true,
      data: university,
      message: 'Universitatea a fost preluată cu succes'
    });
  } catch (error) {
    console.error('Error getting university:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la preluarea universității',
      error: error.message
    });
  }
};

exports.createUniversity = async (req, res) => {
  try {
    console.log('=== Începere creare universitate ===');
    console.log('Received university creation request:', JSON.stringify(req.body, null, 2));

    const requiredFields = ['name', 'type', 'location'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({ 
        success: false,
        message: 'Câmpuri obligatorii lipsă',
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
        message: 'Există deja o universitate cu acest nume'
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
      message: 'Universitatea a fost creată cu succes'
    });
  } catch (error) {
    console.error('Error creating university:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la crearea universității',
      error: error.message,
      details: error.errors
    });
  }
};

exports.updateUniversity = async (req, res) => {
  try {
    console.log('Received update request with body:', JSON.stringify(req.body, null, 2));
    
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
      return res.status(404).json({ 
        success: false,
        message: 'Universitatea nu a fost găsită'
      });
    }
    
    const updatedUniversity = await University.findByPk(req.params.id);
    console.log('Updated university data:', JSON.stringify(updatedUniversity, null, 2));
    
    res.json({
      success: true,
      data: updatedUniversity,
      message: 'Universitatea a fost actualizată cu succes'
    });
  } catch (error) {
    console.error('Error updating university:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la actualizarea universității',
      error: error.message
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
        message: 'Universitatea nu a fost găsită'
      });
    }
    
    res.json({
      success: true,
      message: 'Universitatea a fost ștearsă cu succes'
    });
  } catch (error) {
    console.error('Error deleting university:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la ștergerea universității',
      error: error.message
    });
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
        success: false,
        message: 'Universitatea nu a fost găsită',
        slug: slug
      });
    }

    console.log('Universitatea găsită:', {
      id: university.id,
      name: university.name,
      slug: university.slug
    });

    res.json({
      success: true,
      data: university,
      message: 'Universitatea a fost preluată cu succes'
    });
  } catch (error) {
    console.error('Eroare la obținerea universității:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la obținerea universității',
      error: error.message
    });
  }
}; 