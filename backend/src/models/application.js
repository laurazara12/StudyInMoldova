const { Model, DataTypes } = require('sequelize');

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
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending'
    },
    documents: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
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
  };

  return Application;
}; 