const { Notification, Document } = require('../models');

const createNotification = async (userId, type, message, documentId = null, adminMessage = null) => {
  try {
    const notification = await Notification.create({
      user_id: userId,
      type,
      message,
      document_id: documentId,
      admin_message: adminMessage,
      is_read: false
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

const getNotifications = async (userId) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: userId },
      order: [['createdAt', 'DESC']],
      include: [{
        model: Document,
        attributes: ['document_type', 'filename', 'file_path'],
        as: 'document'
      }]
    });
    return notifications;
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};

const markAsRead = async (notificationId) => {
  try {
    const notification = await Notification.findByPk(notificationId);
    if (notification) {
      notification.is_read = true;
      await notification.save();
    }
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead
}; 