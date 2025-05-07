const { Notification, Document, User } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// Tipuri de notificări
const NOTIFICATION_TYPES = {
  DOCUMENT_DELETED: 'document_deleted',
  DOCUMENT_REJECTED: 'document_rejected',
  DOCUMENT_APPROVED: 'document_approved',
  DOCUMENT_UPDATED: 'document_updated',
  DOCUMENT_EXPIRED: 'document_expired',
  DEADLINE: 'deadline',
  TEAM: 'team'
};

// Mesaje implicite pentru fiecare tip de notificare
const DEFAULT_MESSAGES = {
  [NOTIFICATION_TYPES.DOCUMENT_DELETED]: 'Your document has been deleted by the administrator',
  [NOTIFICATION_TYPES.DOCUMENT_REJECTED]: 'Your document has been rejected by the administrator',
  [NOTIFICATION_TYPES.DOCUMENT_APPROVED]: 'Your document has been approved',
  [NOTIFICATION_TYPES.DOCUMENT_UPDATED]: 'Your document has been updated',
  [NOTIFICATION_TYPES.DOCUMENT_EXPIRED]: 'Your document has expired',
  [NOTIFICATION_TYPES.DEADLINE]: 'You have a deadline approaching',
  [NOTIFICATION_TYPES.TEAM]: 'You have a new activity in your team'
};

// Creează o notificare
const createNotification = async (userId, type, message, documentId = null, adminMessage = null) => {
  try {
    if (!NOTIFICATION_TYPES[type]) {
      throw new Error(`Invalid notification type: ${type}`);
    }

    // Verifică dacă documentul există dacă este specificat
    if (documentId) {
      const document = await Document.findByPk(documentId);
      if (!document) {
        throw new Error('The specified document does not exist');
      }
    }

    // Calculează data de expirare
    const expiresAt = calculateExpirationDate(type);

    const notification = await Notification.create({
      user_id: userId,
      type,
      message: message || DEFAULT_MESSAGES[type],
      document_id: documentId,
      admin_message: adminMessage,
      is_read: false,
      expires_at: expiresAt,
      priority: calculatePriority(type)
    });

    logger.info('Notification created successfully', {
      notificationId: notification.id,
      userId,
      type
    });

    return notification;
  } catch (error) {
    logger.error('Error creating notification', {
      error: error.message,
      userId,
      type
    });
    throw error;
  }
};

// Calculează data de expirare în funcție de tipul notificării
const calculateExpirationDate = (type) => {
  const now = new Date();
  switch (type) {
    case NOTIFICATION_TYPES.DEADLINE:
      return new Date(now.setDate(now.getDate() + 1)); // Expiră peste 24 de ore
    case NOTIFICATION_TYPES.TEAM:
      return new Date(now.setDate(now.getDate() + 7)); // Expiră peste 7 zile
    default:
      return new Date(now.setDate(now.getDate() + 30)); // Expiră peste 30 de zile
  }
};

// Calculează prioritatea notificării
const calculatePriority = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.DEADLINE:
    case NOTIFICATION_TYPES.DOCUMENT_EXPIRED:
      return 'high';
    case NOTIFICATION_TYPES.TEAM:
    case NOTIFICATION_TYPES.DOCUMENT_REJECTED:
      return 'medium';
    default:
      return 'low';
  }
};

// Obține notificările unui utilizator
const getUserNotifications = async (userId, limit = 50, offset = 0) => {
  try {
    // Șterge notificările expirate
    await Notification.destroy({
      where: {
        user_id: userId,
        expires_at: {
          [Op.lt]: new Date()
        }
      }
    });

    const notifications = await Notification.findAll({
      where: { 
        user_id: userId,
        expires_at: {
          [Op.gt]: new Date()
        }
      },
      include: [{
        model: Document,
        attributes: ['id', 'document_type', 'filename', 'file_path'],
        as: 'document'
      }],
      order: [
        ['priority', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit,
      offset
    });

    return notifications;
  } catch (error) {
    logger.error('Error getting notifications', {
      error: error.message,
      userId
    });
    throw error;
  }
};

// Marchează o notificare ca citită
const markAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOne({
      where: { 
        id: notificationId,
        user_id: userId 
      }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await notification.update({ is_read: true });
    logger.info('Notificare marcată ca citită', {
      notificationId,
      userId
    });

    return notification;
  } catch (error) {
    logger.error('Error marking notification as read', {
      error: error.message,
      notificationId,
      userId
    });
    throw error;
  }
};

// Marchează toate notificările unui utilizator ca citite
const markAllAsRead = async (userId) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { user_id: userId, is_read: false } }
    );

    logger.info('All notifications have been marked as read', {
      userId
    });

    return true;
  } catch (error) {
    logger.error('Error marking all notifications as read', {
      error: error.message,
      userId
    });
    throw error;
  }
};

// Șterge o notificare
const deleteNotification = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOne({
      where: { 
        id: notificationId,
        user_id: userId 
      }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await notification.destroy();
    logger.info('Notificare ștearsă', {
      notificationId,
      userId
    });

    return true;
  } catch (error) {
    logger.error('Error deleting notification', {
      error: error.message,
      notificationId,
      userId
    });
    throw error;
  }
};

exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.userId },
      order: [['createdAt', 'DESC']]
    });
    res.json(notifications);
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ message: 'Error getting notifications' });
  }
};

exports.getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notificarea nu a fost găsită' });
    }
    
    res.json(notification);
  } catch (error) {
    console.error('Error getting notification:', error);
    res.status(500).json({ message: 'Error getting notification' });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const { title, message, type, userId } = req.body;
    
    const notification = await Notification.create({
      title,
      message,
      type,
      userId,
      isRead: false
    });
    
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Error creating notification' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    notification.isRead = true;
    await notification.save();
    
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking notification as read' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    await notification.destroy();
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error deleting notification' });
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  NOTIFICATION_TYPES
}; 