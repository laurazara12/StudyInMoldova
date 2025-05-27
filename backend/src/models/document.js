const { Model, DataTypes } = require('sequelize');

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
      allowNull: false,
      comment: 'URL-ul fișierului în Cloudinary'
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Public ID în Cloudinary'
    },
    originalName: {
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
    timestamps: true,
    underscored: true
  });

  Document.associate = (models) => {
    if (!models.User || !models.Application) {
      throw new Error('Modelele necesare nu sunt disponibile pentru Document.associate');
    }
    
    Document.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    Document.belongsToMany(models.Application, {
      through: 'application_documents',
      foreignKey: 'document_id',
      otherKey: 'application_id',
      as: 'applications'
    });
  };

  return Document;
}; 