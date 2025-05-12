const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    // Verificăm dacă utilizatorul există deja
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Email deja înregistrat',
        data: null
      });
    }

    // Criptăm parola
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creăm utilizatorul
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: role || 'student'
    });

    // Generăm token JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Utilizator creat cu succes',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Eroare la înregistrare:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la înregistrare',
      data: null
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Găsim utilizatorul
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Email sau parolă incorectă',
        data: null
      });
    }

    // Verificăm parola
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Email sau parolă incorectă',
        data: null
      });
    }

    // Generăm token JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Autentificare reușită',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Eroare la autentificare:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la autentificare',
      data: null
    });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilizatorul nu a fost găsit',
        data: null
      });
    }

    res.json({
      success: true,
      message: 'Profil utilizator preluat cu succes',
      data: user
    });
  } catch (error) {
    console.error('Eroare la preluarea profilului:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la preluarea profilului',
      data: null
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilizatorul nu a fost găsit',
        data: null
      });
    }

    // Actualizăm datele de bază
    if (name) user.name = name;
    if (email) user.email = email;

    // Dacă se schimbă parola
    if (currentPassword && newPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false,
          message: 'Parola actuală este incorectă',
          data: null
        });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profil actualizat cu succes',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Eroare la actualizarea profilului:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la actualizarea profilului',
      data: null
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilizatorul nu a fost găsit',
        data: null
      });
    }

    await user.destroy();
    res.json({ 
      success: true,
      message: 'Utilizator șters cu succes',
      data: null
    });
  } catch (error) {
    console.error('Eroare la ștergerea utilizatorului:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la ștergerea utilizatorului',
      data: null
    });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilizatorul nu a fost găsit',
        data: null
      });
    }

    res.json({
      success: true,
      message: 'Utilizator preluat cu succes',
      data: user
    });
  } catch (error) {
    console.error('Eroare la obținerea utilizatorului:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la obținerea utilizatorului',
      data: null
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });
    }

    await user.update(req.body);
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Eroare la actualizarea utilizatorului:', error);
    res.status(500).json({ 
      message: 'Eroare la actualizarea utilizatorului',
      error: error.message 
    });
  }
}; 