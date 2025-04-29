const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Document = sequelize.define('Document', {
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
    document_type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['diploma', 'transcript', 'passport', 'photo']]
      }
    },
    file_path: {
      type: DataTypes.STRING,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'documents',
    timestamps: false,
    indexes: [
      {
        fields: ['user_id', 'document_type']
      }
    ]
  });

  return Document;
}; 