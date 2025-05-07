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
        isIn: [['passport', 'diploma', 'transcript', 'cv', 'other', 'photo', 'medical', 'insurance']]
      }
    },
    file_path: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'approved', 'rejected', 'deleted']]
      }
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: true
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    uploaded: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    uploadDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'documents',
    timestamps: true
  });

  Document.associate = (models) => {
    Document.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return Document;
}; 