const { Notification, Document, User } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const { NOTIFICATION_TYPES } = require('../constants/notificationTypes');

// Mesaje implicite pentru fiecare tip de notificare
const DEFAULT_MESSAGES = {
  [NOTIFICATION_TYPES.DOCUMENT_DELETED]: 'Documentul dumneavoastră a fost șters',
  [NOTIFICATION_TYPES.DOCUMENT_REJECTED]: 'Documentul dumneavoastră a fost respins',
  [NOTIFICATION_TYPES.DOCUMENT_APPROVED]: 'Documentul dumneavoastră a fost aprobat',
  [NOTIFICATION_TYPES.DOCUMENT_UPDATED]: 'Documentul dumneavoastră a fost actualizat',
  [NOTIFICATION_TYPES.DOCUMENT_EXPIRED]: 'Documentul dumneavoastră a expirat',
  [NOTIFICATION_TYPES.NEW_DOCUMENT]: 'Un document nou a fost încărcat',
  [NOTIFICATION_TYPES.NEW_APPLICATION]: 'O aplicație nouă a fost trimisă',
  [NOTIFICATION_TYPES.APPLICATION_STATUS_CHANGED]: 'Statusul aplicației dumneavoastră a fost actualizat',
  [NOTIFICATION_TYPES.APPLICATION_WITHDRAWN]: 'Aplicația dumneavoastră a fost retrasă',
  [NOTIFICATION_TYPES.APPLICATION_APPROVED]: 'Aplicația dumneavoastră a fost aprobată',
  [NOTIFICATION_TYPES.APPLICATION_REJECTED]: 'Aplicația dumneavoastră a fost respinsă',
  [NOTIFICATION_TYPES.NEW_USER]: 'Un utilizator nou s-a înregistrat',
  [NOTIFICATION_TYPES.USER_PROFILE_UPDATED]: 'Profilul utilizatorului a fost actualizat',
  [NOTIFICATION_TYPES.USER_DOCUMENT_UPDATED]: 'Documentul utilizatorului a fost actualizat',
  [NOTIFICATION_TYPES.ADMIN_ACTION_REQUIRED]: 'Este necesară o acțiune administrativă',
  [NOTIFICATION_TYPES.ADMIN_REVIEW_REQUIRED]: 'Este necesară o revizuire administrativă',
  [NOTIFICATION_TYPES.ADMIN_DOCUMENT_REVIEW]: 'Este necesară revizuirea unui document',
  [NOTIFICATION_TYPES.ADMIN_APPLICATION_REVIEW]: 'Este necesară revizuirea unei aplicații',
  [NOTIFICATION_TYPES.DEADLINE]: 'Aveți un termen limită care se apropie',
  [NOTIFICATION_TYPES.TEAM]: 'Aveți o activitate nouă în echipa dumneavoastră',
  [NOTIFICATION_TYPES.SYSTEM]: 'Notificare de sistem'
};

// Creează o notificare
const createNotification = async (userId, type, message, documentId = null, adminMessage = null, isAdminNotification = false) => {
  try {
    console.log('Începe crearea notificării:', {
      userId,
      type,
      message,
      documentId,
      isAdminNotification
    });

    if (!NOTIFICATION_TYPES[type]) {
      console.error('Tip de notificare invalid:', type);
      throw new Error(`Invalid notification type: ${type}`);
    }

    // Verifică dacă documentul există dacă este specificat
    if (documentId) {
      const document = await Document.findByPk(documentId);
      if (!document) {
        console.error('Document negăsit:', documentId);
        throw new Error('The specified document does not exist');
      }
    }

    // Calculează data de expirare
    const expiresAt = calculateExpirationDate(type);
    console.log('Data de expirare calculată:', expiresAt);

    // Dacă este o notificare administrativă, o creăm pentru toți adminii
    if (isAdminNotification) {
      console.log('Creare notificare administrativă');
      const admins = await User.findAll({ where: { role: 'admin' } });
      console.log('Admini găsiți:', admins.length);
      
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
      console.log('Notificări administrative create:', notifications.length);
      return notifications;
    }

    // Pentru notificări normale, creăm doar pentru utilizatorul specificat
    console.log('Creare notificare pentru utilizator:', userId);
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

    console.log('Notificare creată cu succes:', {
      notificationId: notification.id,
      userId,
      type
    });

    return notification;
  } catch (error) {
    console.error('Eroare la crearea notificării:', {
      error: error.message,
      userId,
      type,
      stack: error.stack
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
    case NOTIFICATION_TYPES.ADMIN_ACTION_REQUIRED:
    case NOTIFICATION_TYPES.ADMIN_REVIEW_REQUIRED:
      return new Date(now.setDate(now.getDate() + 3)); // Expiră peste 3 zile
    default:
      return new Date(now.setDate(now.getDate() + 30)); // Expiră peste 30 de zile
  }
};

// Calculează prioritatea notificării
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

// Obține titlul notificării în funcție de tip
const getNotificationTitle = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.DOCUMENT_DELETED:
      return 'Document șters';
    case NOTIFICATION_TYPES.DOCUMENT_REJECTED:
      return 'Document respins';
    case NOTIFICATION_TYPES.DOCUMENT_APPROVED:
      return 'Document aprobat';
    case NOTIFICATION_TYPES.DOCUMENT_UPDATED:
      return 'Document actualizat';
    case NOTIFICATION_TYPES.DOCUMENT_EXPIRED:
      return 'Document expirat';
    case NOTIFICATION_TYPES.NEW_DOCUMENT:
      return 'Document nou';
    case NOTIFICATION_TYPES.NEW_APPLICATION:
      return 'Aplicație nouă';
    case NOTIFICATION_TYPES.APPLICATION_STATUS_CHANGED:
      return 'Status aplicație actualizat';
    case NOTIFICATION_TYPES.APPLICATION_WITHDRAWN:
      return 'Aplicație retrasă';
    case NOTIFICATION_TYPES.APPLICATION_APPROVED:
      return 'Aplicație aprobată';
    case NOTIFICATION_TYPES.APPLICATION_REJECTED:
      return 'Aplicație respinsă';
    case NOTIFICATION_TYPES.NEW_USER:
      return 'Utilizator nou';
    case NOTIFICATION_TYPES.USER_PROFILE_UPDATED:
      return 'Profil actualizat';
    case NOTIFICATION_TYPES.USER_DOCUMENT_UPDATED:
      return 'Document utilizator actualizat';
    case NOTIFICATION_TYPES.ADMIN_ACTION_REQUIRED:
      return 'Acțiune administrativă necesară';
    case NOTIFICATION_TYPES.ADMIN_REVIEW_REQUIRED:
      return 'Revizuire administrativă necesară';
    case NOTIFICATION_TYPES.ADMIN_DOCUMENT_REVIEW:
      return 'Revizuire document necesară';
    case NOTIFICATION_TYPES.ADMIN_APPLICATION_REVIEW:
      return 'Revizuire aplicație necesară';
    case NOTIFICATION_TYPES.DEADLINE:
      return 'Termen limită';
    case NOTIFICATION_TYPES.TEAM:
      return 'Activitate echipă';
    case NOTIFICATION_TYPES.SYSTEM:
      return 'Notificare sistem';
    default:
      return 'Notificare nouă';
  }
};

// Obține notificările unui utilizator
const getUserNotifications = async (userId, userRole) => {
  try {
    console.log('Începe getUserNotifications pentru:', { userId, userRole });

    if (!userId) {
      console.error('ID utilizator lipsă în getUserNotifications');
      throw new Error('ID utilizator lipsă');
    }

    // Șterge notificările expirate
    const deletedCount = await Notification.destroy({
      where: {
        user_id: userId,
        expires_at: {
          [Op.lt]: new Date()
        }
      }
    });
    console.log('Notificări expirate șterse:', deletedCount);

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
            is_admin_notification: true, // Notificările pentru admini
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
      // Pentru utilizatori normali, returnează doar notificările personale
      whereClause = {
        ...whereClause,
        user_id: userId,
        is_admin_notification: false // Exclude notificările administrative
      };
    }

    console.log('Clauza WHERE pentru notificări:', whereClause);

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
      limit: 50
    });

    console.log('Notificări găsite:', notifications.length);

    // Transformă rezultatele în formatul așteptat de frontend
    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      user_id: notification.user_id,
      type: notification.type,
      message: notification.message,
      admin_message: notification.admin_message,
      is_read: notification.is_read,
      is_admin_notification: notification.is_admin_notification,
      priority: notification.priority,
      expires_at: notification.expires_at,
      document: notification.document ? {
        id: notification.document.id,
        type: notification.document.document_type,
        filename: notification.document.filename,
        file_path: notification.document.file_path
      } : null
    }));

    return formattedNotifications;
  } catch (error) {
    console.error('Eroare la obținerea notificărilor:', error);
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
      throw new Error('Notificarea nu a fost găsită');
    }

    await notification.update({ is_read: true });
    return true;
  } catch (error) {
    console.error('Eroare la marcarea notificării ca citită:', error);
    throw error;
  }
};

// Marchează toate notificările ca citite
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
    console.error('Eroare la marcarea tuturor notificărilor ca citite:', error);
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
      throw new Error('Notificarea nu a fost găsită');
    }

    await notification.destroy();
    return true;
  } catch (error) {
    console.error('Eroare la ștergerea notificării:', error);
    throw error;
  }
};

// Obține toate notificările
const getAllNotifications = async (req, res) => {
  try {
    console.log('Începe getAllNotifications pentru:', {
      userId: req.user.id,
      userRole: req.user.role
    });

    const notifications = await getUserNotifications(req.user.id, req.user.role);
    
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Eroare la obținerea notificărilor:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea notificărilor',
      error: error.message
    });
  }
};

// Obține o notificare după ID
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
        user_id: req.user.id
      }
    });
    
    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: 'Notificarea nu a fost găsită',
        data: null
      });
    }
    
    notification.is_read = true;
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
  NOTIFICATION_TYPES.NEW_DOCUMENT,
  NOTIFICATION_TYPES.DOCUMENT_APPROVED,
  NOTIFICATION_TYPES.DOCUMENT_REJECTED,
  NOTIFICATION_TYPES.DOCUMENT_DELETED,
  NOTIFICATION_TYPES.APPLICATION_SUBMITTED,
  NOTIFICATION_TYPES.APPLICATION_APPROVED,
  NOTIFICATION_TYPES.APPLICATION_REJECTED,
  NOTIFICATION_TYPES.APPLICATION_WITHDRAWN
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
  VALID_NOTIFICATION_TYPES,
  getAllNotifications,
  getNotificationById
}; 