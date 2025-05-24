const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (email, password) => {
  try {
    console.log('=== Începe procesul de autentificare în controller ===');
    console.log('Email primit:', email);
    console.log('Tip email:', typeof email);

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
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    };
  } catch (error) {
    console.error('Eroare la înregistrare:', error);
    throw error;
  }
};

const getMe = async (userId) => {
  try {
    console.log('=== Începe obținerea datelor utilizatorului ===');
    console.log('ID utilizator:', userId);

    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'name', 'role']
    });

    if (!user) {
      console.log('Utilizatorul nu a fost găsit');
      return {
        success: false,
        message: 'Utilizatorul nu a fost găsit'
      };
    }

    console.log('Utilizator găsit:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    return {
      success: true,
      message: 'Date utilizator preluate cu succes',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  } catch (error) {
    console.error('Eroare la obținerea datelor utilizatorului:', error);
    throw error;
  }
};

const getUserRole = async (req, res) => {
  try {
    console.log('=== Obținere rol utilizator ===');
    console.log('User ID:', req.user.id);
    console.log('User Role:', req.user.role);

    if (!req.user || !req.user.role) {
      console.log('Rolul utilizatorului nu a fost găsit');
      return res.status(401).json({
        success: false,
        message: 'Rolul utilizatorului nu a fost găsit'
      });
    }

    console.log('Rolul utilizatorului a fost găsit:', req.user.role);
    return res.status(200).json({
      success: true,
      message: 'Rolul utilizatorului a fost preluat cu succes',
      data: {
        role: req.user.role,
        id: req.user.id,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error('Eroare la obținerea rolului:', error);
    return res.status(500).json({
      success: false,
      message: 'Eroare la obținerea rolului utilizatorului'
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

const updateUserProfile = async (req, res) => {
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

const deleteUser = async (req, res) => {
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

const getCurrentUser = async (req, res) => {
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

const updateUser = async (req, res) => {
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

module.exports = {
  login,
  register,
  getMe,
  getUserRole,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getCurrentUser,
  updateUser
}; 