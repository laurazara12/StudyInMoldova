const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user',
      validate: {
        isIn: [['user', 'admin']]
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    date_of_birth: {
      type: DataTypes.DATE,
      allowNull: true
    },
    country_of_origin: {
      type: DataTypes.STRING,
      allowNull: true
    },
    nationality: {
      type: DataTypes.STRING,
      allowNull: true
    },
    desired_study_level: {
      type: DataTypes.STRING,
      allowNull: true
    },
    preferred_study_field: {
      type: DataTypes.STRING,
      allowNull: true
    },
    desired_academic_year: {
      type: DataTypes.STRING,
      allowNull: true
    },
    preferred_study_language: {
      type: DataTypes.STRING,
      allowNull: true
    },
    estimated_budget: {
      type: DataTypes.STRING,
      allowNull: true
    },
    accommodation_preferences: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: false
  });

  // Definirea explicită a asociării cu Document
  User.associate = (models) => {
    User.hasMany(models.Document, {
      foreignKey: 'user_id',
      as: 'documents'
    });
  };

  return User;
}; 