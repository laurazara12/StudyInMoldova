const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ApplicationDocument = sequelize.define('ApplicationDocument', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    application_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'applications',
        key: 'id'
      }
    },
    document_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'documents',
        key: 'id'
      }
    }
  }, {
    tableName: 'application_documents',
    timestamps: true,
    underscored: true
  });

  ApplicationDocument.associate = (models) => {
    ApplicationDocument.belongsTo(models.Application, {
      foreignKey: 'application_id',
      as: 'application'
    });
    ApplicationDocument.belongsTo(models.Document, {
      foreignKey: 'document_id',
      as: 'document'
    });
  };

  return ApplicationDocument;
}; 