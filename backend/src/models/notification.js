const { DataTypes } = require('sequelize');
const { NOTIFICATION_TYPES } = require('../constants/notificationTypes');

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
        isIn: [Object.values(NOTIFICATION_TYPES)]
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