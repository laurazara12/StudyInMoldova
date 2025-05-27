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
      allowNull: false
    },
    program_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    university_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('draft', 'submitted', 'under_review', 'accepted', 'rejected'),
      defaultValue: 'draft'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    application_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'applications',
    timestamps: true,
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