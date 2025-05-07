const { Scholarship, User } = require('../models');

exports.getAllScholarships = async (req, res) => {
  try {
    const scholarships = await Scholarship.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });
    res.json(scholarships);
  } catch (error) {
    console.error('Eroare la obținerea burselor:', error);
    res.status(500).json({ message: 'Eroare la obținerea burselor' });
  }
};

exports.getScholarshipById = async (req, res) => {
  try {
    const scholarship = await Scholarship.findByPk(req.params.id);
    
    if (!scholarship) {
      return res.status(404).json({ message: 'Bursa nu a fost găsită' });
    }
    
    res.json(scholarship);
  } catch (error) {
    console.error('Eroare la obținerea bursei:', error);
    res.status(500).json({ message: 'Eroare la obținerea bursei' });
  }
};

exports.createScholarship = async (req, res) => {
  try {
    const { name, description, amount, requirements, deadline } = req.body;
    
    const scholarship = await Scholarship.create({
      name,
      description,
      amount,
      requirements,
      deadline,
      isActive: true
    });
    
    res.status(201).json(scholarship);
  } catch (error) {
    console.error('Eroare la crearea bursei:', error);
    res.status(500).json({ message: 'Eroare la crearea bursei' });
  }
};

exports.updateScholarship = async (req, res) => {
  try {
    const { name, description, amount, requirements, deadline, isActive } = req.body;
    const scholarship = await Scholarship.findByPk(req.params.id);
    
    if (!scholarship) {
      return res.status(404).json({ message: 'Bursa nu a fost găsită' });
    }
    
    scholarship.name = name || scholarship.name;
    scholarship.description = description || scholarship.description;
    scholarship.amount = amount || scholarship.amount;
    scholarship.requirements = requirements || scholarship.requirements;
    scholarship.deadline = deadline || scholarship.deadline;
    scholarship.isActive = isActive !== undefined ? isActive : scholarship.isActive;
    
    await scholarship.save();
    
    res.json(scholarship);
  } catch (error) {
    console.error('Eroare la actualizarea bursei:', error);
    res.status(500).json({ message: 'Eroare la actualizarea bursei' });
  }
};

exports.deleteScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findByPk(req.params.id);
    
    if (!scholarship) {
      return res.status(404).json({ message: 'Bursa nu a fost găsită' });
    }
    
    await scholarship.destroy();
    res.json({ message: 'Bursă ștearsă cu succes' });
  } catch (error) {
    console.error('Eroare la ștergerea bursei:', error);
    res.status(500).json({ message: 'Eroare la ștergerea bursei' });
  }
};

exports.applyForScholarship = async (req, res) => {
  try {
    const { scholarshipId } = req.body;
    const userId = req.user.userId;

    const scholarship = await Scholarship.findByPk(scholarshipId);
    if (!scholarship) {
      return res.status(404).json({ message: 'Bursa nu a fost găsită' });
    }

    if (!scholarship.isActive) {
      return res.status(400).json({ message: 'Bursa nu mai este activă' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });
    }

    // Verificăm dacă utilizatorul a aplicat deja pentru această bursă
    const existingApplication = await user.hasScholarship(scholarship);
    if (existingApplication) {
      return res.status(400).json({ message: 'Ați aplicat deja pentru această bursă' });
    }

    // Adăugăm bursa la utilizator
    await user.addScholarship(scholarship);

    res.json({ message: 'Aplicație pentru bursă trimisă cu succes' });
  } catch (error) {
    console.error('Eroare la aplicarea pentru bursă:', error);
    res.status(500).json({ message: 'Eroare la aplicarea pentru bursă' });
  }
}; 