const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Token lipsă',
        data: null
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Utilizator invalid',
        data: null
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Eroare la verificarea token-ului:', error);
    res.status(401).json({ 
      success: false,
      message: 'Token invalid',
      data: null
    });
  }
};

exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: 'Acces interzis',
        data: null
      });
    }
    next();
  };
};

exports.refreshToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Token lipsă',
        data: null
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Utilizator invalid',
        data: null
      });
    }

    const newToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      success: true,
      message: 'Token reînnoit cu succes',
      data: {
        token: newToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Eroare la reînnoirea token-ului:', error);
    res.status(401).json({ 
      success: false,
      message: 'Token invalid',
      data: null
    });
  }
}; 