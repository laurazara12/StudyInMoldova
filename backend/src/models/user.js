const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

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
      type: DataTypes.ENUM('student', 'admin'),
      defaultValue: 'student'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'pending'),
      defaultValue: 'pending'
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
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
      type: DataTypes.ENUM('Bachelor', 'Master', 'PhD'),
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
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    accommodation_preferences: {
      type: DataTypes.STRING,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });

  User.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  User.associate = (models) => {
    User.hasMany(models.Document, {
      foreignKey: 'user_id',
      as: 'documents'
    });
    User.hasMany(models.SavedProgram, {
      foreignKey: 'user_id',
      as: 'savedPrograms'
    });
    User.hasMany(models.Application, {
      foreignKey: 'user_id',
      as: 'applications'
    });
    User.hasMany(models.Notification, {
      foreignKey: 'user_id',
      as: 'notifications'
    });
  };

  return User;
}; 