const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
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
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [
          'document_deleted',
          'document_approved',
          'document_rejected',
          'document_updated',
          'document_expired',
          'document_uploaded',
          'deadline',
          'team',
          'new_user',
          'new_document',
          'new_application',
          'application_status_changed',
          'application_approved',
          'application_rejected',
          'application_withdrawn',
          'user_profile_updated',
          'user_document_updated',
          'admin_action_required',
          'admin_review_required',
          'admin_document_review',
          'admin_application_review',
          'system'
        ]
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Notificare nouă'
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false
    },
    admin_message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    document_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'documents',
        key: 'id'
      }
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    priority: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'low',
      validate: {
        isIn: [['low', 'medium', 'high']]
      }
    },
    is_admin_notification: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'notifications',
    timestamps: true,
    underscored: true
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Notification.belongsTo(models.Document, { foreignKey: 'document_id', as: 'document' });
  };

  return Notification;
}; 