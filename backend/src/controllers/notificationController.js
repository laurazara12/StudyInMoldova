const { Notification, Document, User } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const { NOTIFICATION_TYPES } = require('../constants/notificationTypes');

// Default messages for each notification type
const DEFAULT_MESSAGES = {
  [NOTIFICATION_TYPES.DOCUMENT_DELETED]: 'Your document has been deleted',
  [NOTIFICATION_TYPES.DOCUMENT_REJECTED]: 'Your document has been rejected',
  [NOTIFICATION_TYPES.DOCUMENT_APPROVED]: 'Your document has been approved',
  [NOTIFICATION_TYPES.DOCUMENT_UPDATED]: 'Your document has been updated',
  [NOTIFICATION_TYPES.DOCUMENT_EXPIRED]: 'Your document has expired',
  [NOTIFICATION_TYPES.DOCUMENT_UPLOADED]: 'Your document has been uploaded successfully',
  [NOTIFICATION_TYPES.NEW_DOCUMENT]: 'A new document has been uploaded',
  [NOTIFICATION_TYPES.NEW_APPLICATION]: 'A new application has been submitted',
  [NOTIFICATION_TYPES.APPLICATION_STATUS_CHANGED]: 'Your application status has been updated',
  [NOTIFICATION_TYPES.APPLICATION_WITHDRAWN]: 'Your application has been withdrawn',
  [NOTIFICATION_TYPES.APPLICATION_APPROVED]: 'Your application has been approved',
  [NOTIFICATION_TYPES.APPLICATION_REJECTED]: 'Your application has been rejected',
  [NOTIFICATION_TYPES.NEW_USER]: 'A new user has registered',
  [NOTIFICATION_TYPES.USER_PROFILE_UPDATED]: 'User profile has been updated',
  [NOTIFICATION_TYPES.USER_DOCUMENT_UPDATED]: 'User document has been updated',
  [NOTIFICATION_TYPES.ADMIN_ACTION_REQUIRED]: 'Administrative action required',
  [NOTIFICATION_TYPES.ADMIN_REVIEW_REQUIRED]: 'Administrative review required',
  [NOTIFICATION_TYPES.ADMIN_DOCUMENT_REVIEW]: 'Document review required',
  [NOTIFICATION_TYPES.ADMIN_APPLICATION_REVIEW]: 'Application review required',
  [NOTIFICATION_TYPES.DEADLINE]: 'You have an approaching deadline',
  [NOTIFICATION_TYPES.TEAM]: 'You have new team activity',
  [NOTIFICATION_TYPES.SYSTEM]: 'System notification'
};

// Create a notification
const createNotification = async (userId, type, message, documentId = null, adminMessage = null, isAdminNotification = false) => {
  try {
    console.log('Starting notification creation:', {
      userId,
      type,
      message,
      documentId,
      isAdminNotification
    });

    if (!Object.values(NOTIFICATION_TYPES).includes(type)) {
      console.error('Invalid notification type:', type);
      throw new Error(`Invalid notification type: ${type}`);
    }

    // Check if document exists if specified
    if (documentId) {
      const document = await Document.findByPk(documentId);
      if (!document) {
        console.error('Document not found:', documentId);
        throw new Error('The specified document does not exist');
      }
    }

    // Calculate expiration date
    const expiresAt = calculateExpirationDate(type);
    console.log('Calculated expiration date:', expiresAt);

    // If it's an admin notification, create it for all admins
    if (isAdminNotification) {
      console.log('Creating admin notification');
      const admins = await User.findAll({ where: { role: 'admin' } });
      console.log('Admins found:', admins.length);
      
      const notifications = await Promise.all(
        admins.map(admin => 
          Notification.create({
            user_id: admin.id,
            type,
            title: getNotificationTitle(type),
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
      console.log('Admin notifications created:', notifications.length);
      return notifications;
    }

    // For normal notifications, create only for the specified user
    console.log('Creating notification for user:', userId);
    const notification = await Notification.create({
      user_id: userId,
      type,
      title: getNotificationTitle(type),
      message: message || DEFAULT_MESSAGES[type],
      document_id: documentId,
      admin_message: adminMessage,
      is_read: false,
      expires_at: expiresAt,
      priority: calculatePriority(type),
      is_admin_notification: false
    });

    console.log('Notification created successfully:', {
      notificationId: notification.id,
      userId,
      type
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', {
      error: error.message,
      userId,
      type,
      stack: error.stack
    });
    throw error;
  }
};

// Calculate expiration date based on notification type
const calculateExpirationDate = (type) => {
  const now = new Date();
  switch (type) {
    case NOTIFICATION_TYPES.DEADLINE:
      return new Date(now.setDate(now.getDate() + 1)); // Expires in 24 hours
    case NOTIFICATION_TYPES.TEAM:
      return new Date(now.setDate(now.getDate() + 7)); // Expires in 7 days
    case NOTIFICATION_TYPES.ADMIN_ACTION_REQUIRED:
    case NOTIFICATION_TYPES.ADMIN_REVIEW_REQUIRED:
      return new Date(now.setDate(now.getDate() + 3)); // Expires in 3 days
    default:
      return new Date(now.setDate(now.getDate() + 30)); // Expires in 30 days
  }
};

// Calculate notification priority
const calculatePriority = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.DEADLINE:
    case NOTIFICATION_TYPES.DOCUMENT_EXPIRED:
    case NOTIFICATION_TYPES.ADMIN_ACTION_REQUIRED:
    case NOTIFICATION_TYPES.ADMIN_REVIEW_REQUIRED:
      return 'high';
    case NOTIFICATION_TYPES.TEAM:
    case NOTIFICATION_TYPES.DOCUMENT_REJECTED:
    case NOTIFICATION_TYPES.NEW_DOCUMENT:
    case NOTIFICATION_TYPES.NEW_USER:
    case NOTIFICATION_TYPES.APPLICATION_STATUS_CHANGED:
      return 'medium';
    default:
      return 'low';
  }
};

// Get notification title based on type
const getNotificationTitle = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.DOCUMENT_DELETED:
      return 'Document deleted';
    case NOTIFICATION_TYPES.DOCUMENT_REJECTED:
      return 'Document rejected';
    case NOTIFICATION_TYPES.DOCUMENT_APPROVED:
      return 'Document approved';
    case NOTIFICATION_TYPES.DOCUMENT_UPDATED:
      return 'Document updated';
    case NOTIFICATION_TYPES.DOCUMENT_EXPIRED:
      return 'Document expired';
    case NOTIFICATION_TYPES.DOCUMENT_UPLOADED:
      return 'Document uploaded';
    case NOTIFICATION_TYPES.NEW_DOCUMENT:
      return 'New document';
    case NOTIFICATION_TYPES.NEW_APPLICATION:
      return 'New application';
    case NOTIFICATION_TYPES.APPLICATION_STATUS_CHANGED:
      return 'Application status updated';
    case NOTIFICATION_TYPES.APPLICATION_WITHDRAWN:
      return 'Application withdrawn';
    case NOTIFICATION_TYPES.APPLICATION_APPROVED:
      return 'Application approved';
    case NOTIFICATION_TYPES.APPLICATION_REJECTED:
      return 'Application rejected';
    case NOTIFICATION_TYPES.NEW_USER:
      return 'New user';
    case NOTIFICATION_TYPES.USER_PROFILE_UPDATED:
      return 'Profile updated';
    case NOTIFICATION_TYPES.USER_DOCUMENT_UPDATED:
      return 'User document updated';
    case NOTIFICATION_TYPES.ADMIN_ACTION_REQUIRED:
      return 'Administrative action required';
    case NOTIFICATION_TYPES.ADMIN_REVIEW_REQUIRED:
      return 'Administrative review required';
    case NOTIFICATION_TYPES.ADMIN_DOCUMENT_REVIEW:
      return 'Document review required';
    case NOTIFICATION_TYPES.ADMIN_APPLICATION_REVIEW:
      return 'Application review required';
    case NOTIFICATION_TYPES.DEADLINE:
      return 'Deadline';
    case NOTIFICATION_TYPES.TEAM:
      return 'Team activity';
    case NOTIFICATION_TYPES.SYSTEM:
      return 'System notification';
    default:
      return 'New notification';
  }
};

// Get user notifications
const getUserNotifications = async (userId, userRole) => {
  try {
    console.log('Starting getUserNotifications for:', { userId, userRole });

    if (!userId) {
      console.error('Missing user ID in getUserNotifications');
      throw new Error('Missing user ID');
    }

    // Delete expired notifications
    const deletedCount = await Notification.destroy({
      where: {
        user_id: userId,
        expires_at: {
          [Op.lt]: new Date()
        }
      }
    });
    console.log('Expired notifications deleted:', deletedCount);

    let whereClause = {
      expires_at: {
        [Op.gt]: new Date()
      }
    };

    // If user is admin, return personal and administrative notifications
    if (userRole === 'admin') {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { user_id: userId }, // Personal notifications
          { 
            is_admin_notification: true, // Admin notifications
            type: {
              [Op.in]: [
                NOTIFICATION_TYPES.ADMIN_ACTION_REQUIRED,
                NOTIFICATION_TYPES.ADMIN_REVIEW_REQUIRED,
                NOTIFICATION_TYPES.ADMIN_DOCUMENT_REVIEW,
                NOTIFICATION_TYPES.ADMIN_APPLICATION_REVIEW,
                NOTIFICATION_TYPES.NEW_USER,
                NOTIFICATION_TYPES.NEW_DOCUMENT,
                NOTIFICATION_TYPES.NEW_APPLICATION
              ]
            }
          }
        ]
      };
    } else {
      // For normal users, return only personal notifications
      whereClause = {
        ...whereClause,
        user_id: userId,
        is_admin_notification: false // Exclude admin notifications
      };
    }

    console.log('WHERE clause for notifications:', whereClause);

    const notifications = await Notification.findAll({
      where: whereClause,
      include: [
        {
          model: Document,
          attributes: ['id', 'document_type', 'filename', 'file_path'],
          as: 'document'
        },
        {
          model: User,
          attributes: ['id', 'name', 'email'],
          as: 'user'
        }
      ],
      order: [
        ['priority', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit: 50
    });

    console.log('Notifications found:', notifications.length);

    // Transform results into frontend expected format
    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      user_id: notification.user_id,
      type: notification.type,
      title: notification.title || getNotificationTitle(notification.type),
      message: notification.message,
      admin_message: notification.admin_message,
      is_read: notification.is_read,
      is_admin_notification: notification.is_admin_notification,
      priority: notification.priority,
      expires_at: notification.expires_at,
      created_at: notification.createdAt,
      updated_at: notification.updatedAt,
      user_name: notification.user ? notification.user.name : null,
      document_type: notification.document ? notification.document.document_type : null,
      document: notification.document ? {
        id: notification.document.id,
        type: notification.document.document_type,
        filename: notification.document.filename,
        file_path: notification.document.file_path
      } : null
    }));

    return formattedNotifications;
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};

// Mark notification as read
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
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
const markAllAsRead = async (userId) => {
  try {
    await Notification.update(
      { is_read: true },
      {
        where: {
          user_id: userId,
          is_read: false
        }
      }
    );
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete notification
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
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Get all notifications
const getAllNotifications = async (req, res) => {
  try {
    console.log('Starting getAllNotifications for:', {
      userId: req.user.id,
      userRole: req.user.role
    });

    const notifications = await getUserNotifications(req.user.id, req.user.role);
    
    res.json({
      success: true,
      data: notifications,
      total: notifications.length
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving notifications',
      error: error.message
    });
  }
};

// Get notification by ID
const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });
    
    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: 'Notification not found',
        data: null
      });
    }
    
    res.json({
      success: true,
      message: 'Notification retrieved successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error getting notification:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error retrieving notification',
      error: error.message,
      data: null
    });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    
    const notification = await Notification.create({
      title,
      message,
      type,
      user_id: req.user.id,
      is_read: false
    });
    
    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating notification',
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
        user_id: req.user.id
      }
    });
    
    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: 'Notification not found',
        data: null
      });
    }
    
    notification.is_read = true;
    await notification.save();
    
    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error marking notification as read',
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
        user_id: req.user.id
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

// Create notification for a user
const createUserNotification = async (userId, type, message, documentId = null) => {
  try {
    const notification = await createNotification(
      userId,
      type,
      message,
      documentId,
      null,
      false // Not an admin notification
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

// Create admin notification
const createAdminNotification = async (type, message, documentId = null, adminMessage = null) => {
  try {
    const notifications = await createNotification(
      null, // No need for userId for admin notifications
      type,
      message,
      documentId,
      adminMessage,
      true // It's an admin notification
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
  NOTIFICATION_TYPES.NEW_DOCUMENT,
  NOTIFICATION_TYPES.DOCUMENT_APPROVED,
  NOTIFICATION_TYPES.DOCUMENT_REJECTED,
  NOTIFICATION_TYPES.DOCUMENT_DELETED,
  NOTIFICATION_TYPES.APPLICATION_SUBMITTED,
  NOTIFICATION_TYPES.APPLICATION_APPROVED,
  NOTIFICATION_TYPES.APPLICATION_REJECTED,
  NOTIFICATION_TYPES.APPLICATION_WITHDRAWN
];

// Create test notifications
const createTestNotifications = async (userId) => {
  try {
    const notifications = [
      {
        type: NOTIFICATION_TYPES.NEW_DOCUMENT,
        message: 'A new document has been uploaded',
        priority: 'medium'
      },
      {
        type: NOTIFICATION_TYPES.DOCUMENT_APPROVED,
        message: 'Your document has been approved',
        priority: 'high'
      },
      {
        type: NOTIFICATION_TYPES.ADMIN_ACTION_REQUIRED,
        message: 'Administrative action required',
        priority: 'high'
      }
    ];

    for (const notification of notifications) {
      await Notification.create({
        user_id: userId,
        type: notification.type,
        title: getNotificationTitle(notification.type),
        message: notification.message,
        is_read: false,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        priority: notification.priority,
        is_admin_notification: notification.type.includes('ADMIN_')
      });
    }

    console.log('Test notifications created successfully');
    return true;
  } catch (error) {
    console.error('Error creating test notifications:', error);
    return false;
  }
};

module.exports = {
  createNotification,
  createUserNotification,
  createAdminNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  NOTIFICATION_TYPES,
  VALID_NOTIFICATION_TYPES,
  getAllNotifications,
  getNotificationById,
  createTestNotifications
}; 