const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Application = sequelize.define('Application', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    program_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'programs',
        key: 'id'
      }
    },
    university_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'universities',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'confirmed', 'rejected', 'withdrawn'),
      allowNull: false,
      defaultValue: 'draft'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true,
    tableName: 'applications',
    underscored: true
  });

  Application.associate = (models) => {
    Application.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    Application.belongsTo(models.Program, {
      foreignKey: 'program_id',
      as: 'program'
    });
    Application.belongsTo(models.University, {
      foreignKey: 'university_id',
      as: 'university'
    });
    Application.belongsToMany(models.Document, {
      through: 'application_documents',
      foreignKey: 'application_id',
      otherKey: 'document_id',
      as: 'documents'
    });
  };

  return Application;
}; 