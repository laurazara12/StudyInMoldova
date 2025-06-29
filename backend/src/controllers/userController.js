const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (email, password) => {
  try {
    // Check if email is an object or null
    if (typeof email === 'object' && email !== null) {
      console.error('Invalid email (object):', email);
      return {
        success: false,
        message: 'Invalid email format'
      };
    }

    // Check if email is a valid string
    if (typeof email !== 'string' || !email.trim()) {
      console.error('Invalid email (empty string or invalid type):', email);
      return {
        success: false,
        message: 'Invalid email format'
      };
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      console.error('Invalid email (incorrect format):', email);
      return {
        success: false,
        message: 'Invalid email format'
      };
    }

    const user = await User.findOne({ where: { email: email.trim() } });
    
    if (!user) {
      console.log('User not found');
      return {
        success: false,
        message: 'Incorrect email or password'
      };
    }


    const isValidPassword = await bcrypt.compare(password, user.password);
    
    
    if (!isValidPassword) {
      console.log('Incorrect password');
      return {
        success: false,
        message: 'Incorrect email or password'
      };
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Successful authentication for:', email);
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
    console.error('Authentication error in controller:', error);
    throw error;
  }
};

const register = async (name, email, password) => {
  try {
    // Basic validations
    if (!name || !email || !password) {
      return {
        success: false,
        message: 'All fields are required'
      };
    }

    // Name validation
    if (name.trim().length < 2) {
      return {
        success: false,
        message: 'Name must be at least 2 characters long'
      };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return {
        success: false,
        message: 'Invalid email format'
      };
    }


    // Check if email already exists
    const existingUser = await User.findOne({ where: { email: email.trim() } });
    
    if (existingUser) {
      return {
        success: false,
        message: 'This email is already registered'
      };
    }

    // Hash password
    const user = await User.create({
      name: name.trim(),
      email: email.trim(),
      password: password.trim(), 
      role: 'user',
      status: 'active'
    });

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      success: true,
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'An error occurred during registration'
    };
  }
};

const getUserRole = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null
      });
    }
    
    res.json({
      success: true,
      message: 'User role retrieved successfully',
      data: {
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error getting user role:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user role',
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
        message: 'User not found',
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

    // Field validations
    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        // Specific validations for each field
        switch (field) {
          case 'name':
            if (typeof req.body[field] !== 'string' || req.body[field].trim().length < 2) {
              return res.status(400).json({
                success: false,
                message: 'Name must be at least 2 characters long',
                data: null
              });
            }
            updateData[field] = req.body[field].trim();
            break;

          case 'phone':
            if (req.body[field] && !/^[+]?[\d\s-]{8,}$/.test(req.body[field])) {
              return res.status(400).json({
                success: false,
                message: 'Invalid phone number format. Must contain at least 8 digits and can include +, spaces or -',
                data: null
              });
            }
            updateData[field] = req.body[field];
            break;

          case 'estimated_budget':
            if (req.body[field] && (isNaN(req.body[field]) || req.body[field] < 0)) {
              return res.status(400).json({
                success: false,
                message: 'Budget must be a positive number',
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
      message: 'User profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating user profile',
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
        message: 'User is not authenticated',
        data: null
      });
    }

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
    console.error('Error getting user profile:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error getting user profile',
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
        message: 'User not found',
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
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating user',
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