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
  TEAM: 'team',
  NEW_USER: 'new_user',
  NEW_DOCUMENT: 'new_document',
  NEW_APPLICATION: 'new_application'
};

// Mesaje implicite pentru fiecare tip de notificare
const DEFAULT_MESSAGES = {
  [NOTIFICATION_TYPES.DOCUMENT_DELETED]: 'Your document has been deleted by the administrator',
  [NOTIFICATION_TYPES.DOCUMENT_REJECTED]: 'Your document has been rejected by the administrator',
  [NOTIFICATION_TYPES.DOCUMENT_APPROVED]: 'Your document has been approved',
  [NOTIFICATION_TYPES.DOCUMENT_UPDATED]: 'Your document has been updated',
  [NOTIFICATION_TYPES.DOCUMENT_EXPIRED]: 'Your document has expired',
  [NOTIFICATION_TYPES.DEADLINE]: 'You have a deadline approaching',
  [NOTIFICATION_TYPES.TEAM]: 'You have a new activity in your team',
  [NOTIFICATION_TYPES.NEW_USER]: 'A new user has registered',
  [NOTIFICATION_TYPES.NEW_DOCUMENT]: 'A new document has been uploaded',
  [NOTIFICATION_TYPES.NEW_APPLICATION]: 'A new application has been submitted'
};

// Creează o notificare
const createNotification = async (userId, type, message, documentId = null, adminMessage = null, isAdminNotification = false) => {
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

    // Dacă este o notificare administrativă, o creăm pentru toți adminii
    if (isAdminNotification) {
      const admins = await User.findAll({ where: { role: 'admin' } });
      const notifications = await Promise.all(
        admins.map(admin => 
          Notification.create({
            user_id: admin.id,
            type,
            message: message || DEFAULT_MESSAGES[type],
            document_id: documentId,
            admin_message: adminMessage,
            is_read: false,
            expires_at: expiresAt,
            priority: calculatePriority(type),
            is_admin_notification: true
          })
        )
      );
      return notifications;
    }

    // Pentru notificări normale, creăm doar pentru utilizatorul specificat
    const notification = await Notification.create({
      user_id: userId,
      type,
      message: message || DEFAULT_MESSAGES[type],
      document_id: documentId,
      admin_message: adminMessage,
      is_read: false,
      expires_at: expiresAt,
      priority: calculatePriority(type),
      is_admin_notification: false
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
    case NOTIFICATION_TYPES.NEW_APPLICATION:
      return 'high';
    case NOTIFICATION_TYPES.TEAM:
    case NOTIFICATION_TYPES.DOCUMENT_REJECTED:
    case NOTIFICATION_TYPES.NEW_DOCUMENT:
    case NOTIFICATION_TYPES.NEW_USER:
      return 'medium';
    default:
      return 'low';
  }
};

// Obține notificările unui utilizator
const getUserNotifications = async (userId, userRole, limit = 50, offset = 0) => {
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

    let whereClause = {
      expires_at: {
        [Op.gt]: new Date()
      }
    };

    // Dacă utilizatorul este admin, returnează notificările personale și cele administrative
    if (userRole === 'admin') {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { user_id: userId }, // Notificările personale
          { 
            is_admin_notification: true // Notificările pentru admini
          }
        ]
      };
    } else {
      // Pentru utilizatori normali, returnează doar notificările personale
      whereClause = {
        ...whereClause,
        user_id: userId,
        is_admin_notification: false // Exclude notificările administrative
      };
    }

    const notifications = await Notification.findAll({
      where: whereClause,
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
    res.json({
      success: true,
      message: 'Notificările au fost preluate cu succes',
      data: notifications,
      total: notifications.length
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la preluarea notificărilor',
      error: error.message,
      data: [],
      total: 0
    });
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
      return res.status(404).json({ 
        success: false,
        message: 'Notificarea nu a fost găsită',
        data: null
      });
    }
    
    res.json({
      success: true,
      message: 'Notificarea a fost preluată cu succes',
      data: notification
    });
  } catch (error) {
    console.error('Error getting notification:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la preluarea notificării',
      error: error.message,
      data: null
    });
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
    
    res.status(201).json({
      success: true,
      message: 'Notificarea a fost creată cu succes',
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la crearea notificării',
      error: error.message,
      data: null
    });
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
      return res.status(404).json({ 
        success: false,
        message: 'Notificarea nu a fost găsită',
        data: null
      });
    }
    
    notification.isRead = true;
    await notification.save();
    
    res.json({
      success: true,
      message: 'Notificarea a fost marcată ca citită',
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la marcarea notificării ca citită',
      error: error.message,
      data: null
    });
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

// Creează o notificare pentru un utilizator
const createUserNotification = async (userId, type, message, documentId = null) => {
  try {
    const notification = await createNotification(
      userId,
      type,
      message,
      documentId,
      null,
      false // Nu este o notificare administrativă
    );

    logger.info('User notification created successfully', {
      notificationId: notification.id,
      userId,
      type
    });

    return notification;
  } catch (error) {
    logger.error('Error creating user notification', {
      error: error.message,
      userId,
      type
    });
    throw error;
  }
};

// Creează o notificare administrativă
const createAdminNotification = async (type, message, documentId = null, adminMessage = null) => {
  try {
    const notifications = await createNotification(
      null, // Nu avem nevoie de userId pentru notificări administrative
      type,
      message,
      documentId,
      adminMessage,
      true // Este o notificare administrativă
    );

    logger.info('Admin notification created successfully', {
      type,
      count: notifications.length
    });

    return notifications;
  } catch (error) {
    logger.error('Error creating admin notification', {
      error: error.message,
      type
    });
    throw error;
  }
};

const VALID_NOTIFICATION_TYPES = [
  'new_document',
  'document_approved',
  'document_rejected',
  'document_deleted',
  'application_submitted',
  'application_approved',
  'application_rejected',
  'application_withdrawn'
];

module.exports = {
  createNotification,
  createUserNotification,
  createAdminNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  NOTIFICATION_TYPES,
  VALID_NOTIFICATION_TYPES
}; 