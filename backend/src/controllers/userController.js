const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (email, password) => {
  try {

    // Verificăm dacă email-ul este un obiect sau null
    if (typeof email === 'object' && email !== null) {
      console.error('Email invalid (obiect):', email);
      return {
        success: false,
        message: 'Format email invalid'
      };
    }

    // Verificăm dacă email-ul este un string valid
    if (typeof email !== 'string' || !email.trim()) {
      console.error('Email invalid (string gol sau tip invalid):', email);
      return {
        success: false,
        message: 'Format email invalid'
      };
    }

    // Verificăm formatul email-ului
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      console.error('Email invalid (format incorect):', email);
      return {
        success: false,
        message: 'Format email invalid'
      };
    }

    const user = await User.findOne({ where: { email: email.trim() } });
    
    if (!user) {
      console.log('Utilizatorul nu a fost găsit');
      return {
        success: false,
        message: 'Email sau parolă incorectă'
      };
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      console.log('Parolă incorectă');
      return {
        success: false,
        message: 'Email sau parolă incorectă'
      };
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Autentificare reușită pentru:', email);
    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      }
    };
  } catch (error) {
    console.error('Eroare la autentificare în controller:', error);
    throw error;
  }
};

const register = async (name, email, password) => {
  try {
    // Verificăm formatul email-ului
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return {
        success: false,
        message: 'Format email invalid'
      };
    }

    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      return {
        success: false,
        message: 'Acest email este deja înregistrat'
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user'
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      success: true,
      message: 'Înregistrare reușită',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      }
    };
  } catch (error) {
    console.error('Eroare la înregistrare:', error);
    throw error;
  }
};

const getUserRole = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizatorul nu a fost găsit',
        data: null
      });
    }
    
    res.json({
      success: true,
      message: 'Rolul utilizatorului a fost preluat cu succes',
      data: {
        role: user.role
      }
    });
  } catch (error) {
    console.error('Eroare la obținerea rolului utilizatorului:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea rolului utilizatorului',
      data: null
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found',
        data: null
      });
    }

    res.json({
      success: true,
      message: 'User profile retrieved successfully',
      data: user
    });
  } catch (error) {
    console.error('Error in getUserProfile controller:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error in getUserProfile controller',
      data: null
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilizatorul nu a fost găsit',
        data: null
      });
    }

    const allowedFields = [
      'name',
      'phone',
      'date_of_birth',
      'country_of_origin',
      'nationality',
      'desired_study_level',
      'preferred_study_field',
      'desired_academic_year',
      'preferred_study_language',
      'estimated_budget',
      'accommodation_preferences'
    ];

    // Validări pentru câmpuri
    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        // Validări specifice pentru fiecare câmp
        switch (field) {
          case 'name':
            if (typeof req.body[field] !== 'string' || req.body[field].trim().length < 2) {
              return res.status(400).json({
                success: false,
                message: 'Numele trebuie să aibă cel puțin 2 caractere',
                data: null
              });
            }
            updateData[field] = req.body[field].trim();
            break;

          case 'phone':
            if (req.body[field] && !/^[+]?[\d\s-]{8,}$/.test(req.body[field])) {
              return res.status(400).json({
                success: false,
                message: 'Format număr de telefon invalid. Trebuie să conțină cel puțin 8 cifre și poate include +, spații sau -',
                data: null
              });
            }
            updateData[field] = req.body[field];
            break;

          case 'estimated_budget':
            if (req.body[field] && (isNaN(req.body[field]) || req.body[field] < 0)) {
              return res.status(400).json({
                success: false,
                message: 'Bugetul trebuie să fie un număr pozitiv',
                data: null
              });
            }
            updateData[field] = req.body[field];
            break;

          default:
            if (req.body[field] !== undefined) {
              updateData[field] = req.body[field];
            }
        }
      }
    }

    await user.update(updateData);

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      message: 'Profilul utilizatorului a fost actualizat cu succes',
      data: updatedUser
    });
  } catch (error) {
    console.error('Eroare la actualizarea profilului utilizatorului:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la actualizarea profilului utilizatorului',
      data: null
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found',
        data: null
      });
    }

    await user.destroy();
    res.json({ 
      success: true,
      message: 'User deleted successfully',
      data: null
    });
  } catch (error) {
    console.error('Error in deleteUser controller:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error in deleteUser controller',
      data: null
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Utilizatorul nu este autentificat',
        data: null
      });
    }

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
      message: 'Profilul utilizatorului a fost preluat cu succes',
      data: user
    });
  } catch (error) {
    console.error('Eroare la obținerea profilului utilizatorului:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la obținerea profilului utilizatorului',
      data: null
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilizatorul nu a fost găsit',
        data: null
      });
    }

    const allowedFields = [
      'name',
      'email',
      'phone',
      'date_of_birth',
      'country_of_origin',
      'nationality'
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    await user.update(updateData);

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      message: 'Utilizatorul a fost actualizat cu succes',
      data: updatedUser
    });
  } catch (error) {
    console.error('Eroare la actualizarea utilizatorului:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la actualizarea utilizatorului',
      data: null
    });
  }
};

module.exports = {
  login,
  register,
  getUserRole,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getCurrentUser,
  updateUser
}; 