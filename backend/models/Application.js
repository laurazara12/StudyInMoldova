const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  programId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Programs',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'under_review', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  adminNotes: {
    type: DataTypes.TEXT,
    defaultValue: ''
  }
}, {
  timestamps: true,
  updatedAt: 'updatedAt',
  createdAt: 'createdAt'
});

module.exports = Application; 