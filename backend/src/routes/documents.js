const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { auth, adminAuth } = require('../middleware/auth');
const { User, Document } = require('../models');
const { Op } = require('sequelize');
const { createNotification, NOTIFICATION_TYPES } = require('../controllers/notificationController');
const winston = require('winston');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
const { 
  getAllDocuments, 
  getDocumentById, 
  createDocument, 
  updateDocument,
  deleteDocument,
  getUserDocuments
} = require('../controllers/documentController');
const MemoryStore = require('express-rate-limit').MemoryStore;

const router = express.Router();

// Configurare pentru logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Middleware pentru gestionarea erorilor
const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    user: req.user ? req.user.id : 'anonymous'
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Middleware pentru validarea documentelor
const validateDocument = async (req, res, next) => {
  try {
    console.log('=== Începe validarea documentului ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request file:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    } : 'Nu există fișier');
    
    const { document_type } = req.body;
    console.log('Tip document:', document_type);
    
    if (!document_type) {
      console.error('Document type missing from request body');
      return res.status(400).json({
        success: false,
        message: 'Tipul documentului este obligatoriu',
        details: 'Specificați tipul documentului în câmpul document_type'
      });
    }

    if (!req.file) {
      console.error('Fișierul lipsește din request');
      return res.status(400).json({
        success: false,
        message: 'Fișierul este obligatoriu',
        details: 'Este necesar să încărcați un fișier'
      });
    }

    const validTypes = ['passport', 'diploma', 'transcript', 'cv', 'other', 'photo', 'medical', 'insurance'];
    console.log('Tip document valid:', validTypes.includes(document_type));
    
    if (!validTypes.includes(document_type)) {
      console.error('Tip de document invalid:', document_type);
      return res.status(400).json({
        success: false,
        message: 'Tip de document invalid',
        details: `Tipurile valide sunt: ${validTypes.join(', ')}`
      });
    }

    // Verifică dimensiunea fișierului
    console.log('Dimensiune fișier:', req.file.size);
    if (req.file.size > 10 * 1024 * 1024) { // 10MB
      console.error('Fișier prea mare:', req.file.size);
      return res.status(400).json({
        success: false,
        message: 'Fișier prea mare',
        details: 'Dimensiunea maximă permisă pentru fișier este de 10MB'
      });
    }

    // Verifică tipul fișierului
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    console.log('Verificare tip fișier:', {
      mimetype: req.file.mimetype,
      isAllowed: allowedMimeTypes.includes(req.file.mimetype)
    });

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      console.error('Tip de fișier neacceptat:', req.file.mimetype);
      return res.status(400).json({
        success: false,
        message: 'Tip de fișier neacceptat',
        details: 'Folosiți doar PDF, JPG, PNG, DOC, DOCX, XLS sau XLSX'
      });
    }

    console.log('Document validat cu succes:', {
      document_type,
      file: {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });
    console.log('=== Validare document finalizată cu succes ===');

    next();
  } catch (error) {
    console.error('=== Eroare la validarea documentului ===');
    console.error('Detalii eroare:', {
      message: error.message,
      stack: error.stack,
      document_type: req.body?.document_type,
      file: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : 'Nu există fișier'
    });
    
    // Dacă există un fișier încărcat și apare o eroare, îl ștergem
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('Fișier temporar șters după eroare:', req.file.path);
      } catch (unlinkError) {
        console.error('Eroare la ștergerea fișierului temporar:', unlinkError);
      }
    }
    res.status(400).json({
      success: false,
      message: 'Eroare la validarea documentului',
      details: error.message
    });
  }
};

// Verificăm și creăm directorul uploads dacă nu există
const uploadsDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Directory uploads created:', uploadsDir);
  } catch (error) {
    console.error('Error creating uploads directory:', error);
  }
}

// Configurare multer pentru încărcarea fișierelor
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userDir = path.join(uploadsDir, req.user.id.toString());
    fs.mkdirSync(userDir, { recursive: true });
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const newFilename = `${req.body.document_type}_${timestamp}${ext}`;
    cb(null, newFilename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Tip de fișier neacceptat. Sunt acceptate doar fișierele PDF, JPG, PNG, DOC, DOCX, XLS și XLSX.'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: fileFilter
});

// Middleware pentru gestionarea erorilor multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Fișierul este prea mare. Dimensiunea maximă permisă este de 10MB.'
      });
    }
    return res.status(400).json({
      error: `Eroare la încărcarea fișierului: ${err.message}`
    });
  } else if (err) {
    return res.status(400).json({
      error: err.message
    });
  }
  next();
};

// Configurare pentru caching
const cache = new NodeCache({ stdTTL: 600 }); // Cache pentru 10 minute

// Middleware pentru caching
const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    const key = req.originalUrl || req.url;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    res.originalJson = res.json;
    res.json = (body) => {
      cache.set(key, body, duration);
      res.originalJson(body);
    };
    next();
  };
};

// Rate limiters cu MemoryStore
const uploadLimiter = rateLimit({
  store: new MemoryStore(),
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 10, // maxim 10 încărcări per fereastră
  message: {
    success: false,
    message: 'Prea multe cereri de încărcare. Vă rugăm să așteptați 15 minute.',
    details: 'Limita de încărcări a fost depășită. Vă rugăm să încercați din nou mai târziu.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const downloadLimiter = rateLimit({
  store: new MemoryStore(),
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 20, // maxim 20 descărcări per fereastră
  message: {
    success: false,
    message: 'Prea multe cereri de descărcare. Vă rugăm să așteptați 15 minute.',
    details: 'Limita de descărcări a fost depășită. Vă rugăm să încercați din nou mai târziu.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const listLimiter = rateLimit({
  store: new MemoryStore(),
  windowMs: 5 * 60 * 1000, // 5 minute
  max: 50, // maxim 50 de cereri per fereastră
  message: {
    success: false,
    message: 'Prea multe cereri de listare. Vă rugăm să așteptați 5 minute.',
    details: 'Limita de cereri de listare a fost depășită. Vă rugăm să încercați din nou mai târziu.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rute pentru documente
router.get('/user-documents', auth, listLimiter, async (req, res) => {
  try {
    console.log('Începe preluarea documentelor pentru utilizatorul:', req.user.id);
    
    if (!req.user || !req.user.id) {
      console.error('User invalid sau lipsă');
      return res.status(401).json({ 
        success: false,
        message: 'Utilizator invalid' 
      });
    }

    // Verificăm și creăm directorul utilizatorului
    const userDir = path.join(uploadsDir, req.user.id.toString());
    if (!fs.existsSync(userDir)) {
      console.log('Directorul utilizatorului nu există, se creează...');
      fs.mkdirSync(userDir, { recursive: true });
    }

    console.log('Se interoghează baza de date pentru documente...');
    const documents = await Document.findAll({
      where: { 
        user_id: req.user.id,
        status: {
          [Op.not]: 'deleted'
        }
      },
      attributes: ['id', 'document_type', 'file_path', 'createdAt', 'status', 'filename', 'originalName'],
      order: [['createdAt', 'DESC']]
    });

    console.log('Documente găsite în baza de date:', documents.length);

    // Filtrăm documentele valide
    const validDocuments = documents.filter(doc => {
      try {
        if (!doc.file_path) {
          console.log(`Document ${doc.id} nu are cale specificată`);
          return false;
        }

        let absolutePath;
        if (path.isAbsolute(doc.file_path)) {
          absolutePath = doc.file_path;
        } else {
          absolutePath = path.join(uploadsDir, req.user.id.toString(), path.basename(doc.file_path));
        }

        const exists = fs.existsSync(absolutePath);
        if (!exists) {
          console.log(`Document ${doc.id} nu există fizic la calea ${absolutePath}`);
          return false;
        }
        return true;
      } catch (error) {
        console.error(`Eroare la verificarea documentului ${doc.id}:`, error);
        return false;
      }
    });

    console.log('Documente valide găsite:', validDocuments.length);
    
    // Formatăm documentele pentru răspuns
    const formattedDocuments = validDocuments.map(doc => ({
      id: doc.id,
      document_type: doc.document_type,
      file_path: doc.file_path,
      createdAt: doc.createdAt,
      status: doc.status || 'pending',
      filename: doc.filename,
      originalName: doc.originalName,
      uploaded: true,
      uploadDate: doc.createdAt
    }));

    // Calculăm statisticile
    const stats = {
      pending: formattedDocuments.filter(doc => doc.status === 'pending').length,
      approved: formattedDocuments.filter(doc => doc.status === 'approved').length,
      rejected: formattedDocuments.filter(doc => doc.status === 'rejected').length
    };

    console.log('Se trimite răspuns cu documentele valide');
    
    // Construim răspunsul final
    const response = {
      success: true,
      message: formattedDocuments.length === 0 ? 
        'La moment nu există documente încărcate în profilul dumneavoastră' : 
        'Documentele au fost preluate cu succes',
      data: formattedDocuments,
      total: formattedDocuments.length,
      status: stats
    };

    console.log('Răspuns formatat:', JSON.stringify(response, null, 2));
    res.json(response);

  } catch (error) {
    console.error('Eroare detaliată la preluarea documentelor:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });

    // Răspuns de eroare consistent
    res.status(500).json({ 
      success: false,
      message: 'Eroare la preluarea documentelor',
      error: error.message,
      data: [],
      total: 0,
      status: {
        pending: 0,
        approved: 0,
        rejected: 0
      }
    });
  }
});

router.get('/:id', auth, getDocumentById);
router.post('/', auth, createDocument);
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    console.log('Încercare actualizare document:', {
      documentId: req.params.id,
      requestBody: req.body,
      userId: req.user.id
    });

    // Verificăm dacă documentul există
    const document = await Document.findOne({
      where: { 
        id: req.params.id,
        status: {
          [Op.not]: 'deleted'
        }
      }
    });

    if (!document) {
      console.log('Document negăsit pentru ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Documentul nu a fost găsit',
        data: null
      });
    }

    const { status, document_type, file_path, filename, originalName, user_id } = req.body;

    // Validăm statusul
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status invalid. Statusurile valide sunt: pending, approved, rejected',
        data: null
      });
    }

    // Actualizăm documentul
    const updateData = {
      status,
      document_type: document_type || document.document_type,
      file_path: file_path || document.file_path,
      filename: filename || document.filename,
      originalName: originalName || document.originalName,
      user_id: user_id || document.user_id
    };

    await document.update(updateData);

    // Creăm notificare pentru utilizator
    await createDocumentNotification(
      document.user_id,
      'document_updated',
      document.document_type,
      document.id
    );

    console.log('Document actualizat cu succes:', {
      documentId: document.id,
      newStatus: status
    });

    res.json({
      success: true,
      message: 'Document actualizat cu succes',
      data: document
    });

  } catch (error) {
    console.error('Eroare la actualizarea documentului:', {
      error: error.message,
      stack: error.stack,
      documentId: req.params.id
    });

    res.status(500).json({
      success: false,
      message: 'Eroare la actualizarea documentului',
      error: error.message,
      data: null
    });
  }
});
router.delete('/:id', auth, async (req, res) => {
  try {
    const documentId = req.params.id;
    const { admin_message } = req.body;

    // Verificăm dacă documentul există
    const document = await Document.findByPk(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documentul nu a fost găsit'
      });
    }

    // Verificăm permisiunile
    if (req.user.role === 'admin') {
      // Administratorii pot șterge orice document
      console.log('Administrator șterge document:', {
        documentId,
        userId: document.user_id,
        adminId: req.user.id
      });
    } else if (document.user_id === req.user.id) {
      // Utilizatorii pot șterge doar documentele lor
      console.log('Utilizator șterge propriul document:', {
        documentId,
        userId: req.user.id
      });
    } else {
      return res.status(403).json({
        success: false,
        message: 'Nu aveți permisiunea de a șterge acest document'
      });
    }

    // Creăm notificările în funcție de rolul utilizatorului și statusul documentului
    try {
      if (req.user.role === 'admin') {
        // Dacă adminul șterge documentul, notificăm utilizatorul
        await createDocumentNotification(
          document.user_id,
          NOTIFICATION_TYPES.DOCUMENT_DELETED,
          document.document_type,
          document.id,
          { customMessage: admin_message }
        );
      } else if (document.status === 'approved') {
        // Dacă utilizatorul șterge un document aprobat, notificăm adminul
        const admins = await User.findAll({ where: { role: 'admin' } });
        for (const admin of admins) {
          await createDocumentNotification(
            admin.id,
            NOTIFICATION_TYPES.DOCUMENT_DELETED,
            document.document_type,
            document.id,
            { customMessage: `User ${req.user.name} has deleted the ${document.document_type} document.` }
          );
        }
      }
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Continuăm cu ștergerea documentului chiar dacă notificarea eșuează
    }

    // Construiește calea către fișier
    const userDir = path.join(__dirname, '../../../uploads', document.user_id.toString());
    const absolutePath = path.join(userDir, path.basename(document.file_path));

    // Șterge fișierul fizic dacă există
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
        console.log('Fișier șters cu succes:', absolutePath);
      } catch (error) {
        console.error('Eroare la ștergerea fișierului:', error);
        // Continuăm cu ștergerea din baza de date chiar dacă ștergerea fișierului a eșuat
      }
    }

   
    await document.update({ status: 'deleted' });
    
    const documents = await Document.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });
    const status = {
      pending: documents.filter(doc => doc.status === 'pending').length,
      approved: documents.filter(doc => doc.status === 'approved').length,
      rejected: documents.filter(doc => doc.status === 'rejected').length
    };
    res.json({ 
      success: true,
      message: 'Document șters cu succes',
      data: documents,
      status
    });
  } catch (error) {
    console.error('Eroare la ștergerea documentului:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la ștergerea documentului',
      error: error.message
    });
  }
});

// Get all documents (admin only)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    logger.info('Încărcare documente pentru admin', {
      role: req.user.role,
      timestamp: new Date().toISOString(),
      userId: req.user.id
    });

    const documents = await Document.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      message: 'Documentele au fost preluate cu succes',
      data: documents,
      total: documents.length
    });
  } catch (error) {
    logger.error('Eroare la încărcarea documentelor', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userId: req.user.id
    });
    res.status(500).json({ 
      success: false,
      message: 'Eroare la încărcarea documentelor',
      error: error.message,
      data: [],
      total: 0
    });
  }
});

// Upload document
router.post('/upload',
  auth,
  upload.single('file'),
  handleMulterError,
  validateDocument,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          message: 'Nu s-a încărcat niciun fișier',
          details: 'Este necesar să încărcați un fișier'
        });
      }

      const documentType = req.body.document_type;
      
      if (!documentType) {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ 
          success: false,
          message: 'Tipul documentului este obligatoriu',
          details: 'Specificați tipul documentului în câmpul document_type'
        });
      }

      // Verifică dacă utilizatorul are deja un document de acest tip
      const existingDocument = await Document.findOne({
        where: {
          user_id: req.user.id,
          document_type: documentType,
          status: { [Op.ne]: 'deleted' }
        }
      });

      if (existingDocument) {
        try {
          // Șterge fișierul vechi
          const oldFilePath = path.join(uploadsDir, existingDocument.file_path);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
          
          // Actualizează documentul existent în loc să-l ștergem
          await existingDocument.update({
            file_path: path.join(req.user.id.toString(), req.file.filename),
            filename: req.file.filename,
            originalName: req.file.originalname,
            status: 'pending',
            uploaded: true,
            uploadDate: new Date()
          });

          // Adăugăm notificare pentru actualizarea documentului
          await createNotification(
            req.user.id,
            NOTIFICATION_TYPES.DOCUMENT_UPDATED,
            `Your ${documentType} document has been updated`,
            existingDocument.id
          );

          return res.status(200).json({
            success: true,
            message: 'Document actualizat cu succes',
            document: {
              id: existingDocument.id,
              document_type: existingDocument.document_type,
              status: existingDocument.status,
              uploaded: existingDocument.uploaded,
              uploadDate: existingDocument.uploadDate
            }
          });
        } catch (error) {
          console.error('Eroare la actualizarea documentului existent:', error);
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
          throw error;
        }
      }

      // Creează documentul nou
      const document = await Document.create({
        user_id: req.user.id,
        document_type: documentType,
        file_path: path.join(req.user.id.toString(), req.file.filename),
        filename: req.file.filename,
        originalName: req.file.originalname,
        status: 'pending',
        uploaded: true,
        uploadDate: new Date()
      });

      // Adăugăm notificare pentru încărcarea documentului
      await createNotification(
        req.user.id,
        NOTIFICATION_TYPES.DOCUMENT_UPLOADED,
        `Your ${documentType} document has been successfully uploaded`,
        document.id
      );

      res.status(201).json({
        success: true,
        message: 'Document încărcat cu succes',
        document: {
          id: document.id,
          document_type: document.document_type,
          status: document.status,
          uploaded: document.uploaded,
          uploadDate: document.uploadDate
        }
      });
    } catch (error) {
      console.error('Eroare la încărcarea documentului:', error);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ 
        success: false,
        message: 'Eroare la încărcarea documentului',
        error: error.message
      });
    }
  }
);

// Obține toate documentele unui utilizator
router.get('/my-documents', auth, async (req, res) => {
  try {
    const documents = await Document.findAll({
      where: { user_id: req.user.id },
      attributes: ['id', 'user_id', 'document_type', 'file_path', 'createdAt'],
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        attributes: ['name', 'email'],
        as: 'user'
      }]
    });

    res.json(documents);
  } catch (error) {
    console.error('Eroare la obținerea documentelor:', error);
    res.status(500).json({ message: 'Eroare la obținerea documentelor' });
  }
});

// Obține toate documentele (doar pentru admin)
router.get('/all-documents', auth, adminAuth, async (req, res) => {
  try {
    const documents = await Document.findAll({
      attributes: ['id', 'user_id', 'document_type', 'file_path', 'createdAt'],
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        attributes: ['name', 'email'],
        as: 'user'
      }]
    });

    res.json(documents);
  } catch (error) {
    console.error('Eroare la obținerea documentelor:', error);
    res.status(500).json({ message: 'Eroare la obținerea documentelor' });
  }
});

// Middleware pentru verificarea permisiunilor
const checkPermissions = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      where: { id: req.params.id },
      include: [{
        model: User,
        attributes: ['id', 'role'],
        as: 'user'
      }]
    });

    if (!document) {
      throw new Error('Documentul nu a fost găsit');
    }

    // Verifică dacă utilizatorul are acces la document
    if (req.user.role !== 'admin' && document.user_id !== req.user.id) {
      throw new Error('Nu aveți permisiunea să accesați acest document');
    }

    req.document = document;
    next();
  } catch (error) {
    next(error);
  }
};

// Optimizare pentru descărcarea fișierelor
router.get('/download/:id', auth, downloadLimiter, checkPermissions, async (req, res, next) => {
  try {
    const document = req.document;
    const filePath = path.resolve(document.file_path);
    
    // Verifică dacă fișierul există
    if (!fs.existsSync(filePath)) {
      throw new Error('Fișierul nu a fost găsit');
    }

    // Setează headerele pentru descărcare
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(document.originalName)}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-cache');

    // Trimite fișierul
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('Eroare la citirea fișierului:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Eroare la citirea fișierului'
        });
      }
    });

  } catch (error) {
    console.error('Eroare la descărcarea documentului:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la descărcarea documentului',
      error: error.message
    });
  }
});

// Șterge un document (doar pentru admin)
router.delete('/admin/:id', auth, adminAuth, async (req, res) => {
  try {
    console.log('Încercare ștergere document (admin):', req.params.id);
    
    const document = await Document.findOne({
      where: { 
        id: req.params.id,
        status: {
          [Op.not]: 'deleted'
        }
      },
      include: [{
        model: User,
        attributes: ['name', 'email'],
        as: 'user'
      }]
    });

    if (!document) {
      console.log('Document negăsit pentru ID:', req.params.id);
      return res.status(404).json({ 
        success: false,
        message: 'Documentul nu a fost găsit în baza de date' 
      });
    }

    console.log('Document găsit:', {
      id: document.id,
      user_id: document.user_id,
      file_path: document.file_path,
      originalName: document.originalName,
      filename: document.filename
    });

    // Verificăm dacă directorul utilizatorului există
    const userDir = path.join(uploadsDir, document.user_id.toString());
    console.log('Director utilizator:', {
      path: userDir,
      exists: fs.existsSync(userDir)
    });

    // Construiește calea corectă pentru fișier
    const absolutePath = path.join(userDir, path.basename(document.file_path));
    
    console.log('Căi:', {
      documentPath: absolutePath,
      uploadsDir: uploadsDir,
      fileExists: fs.existsSync(absolutePath),
      originalPath: document.file_path,
      basename: path.basename(document.file_path)
    });

    // Șterge fișierul dacă există
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
        console.log('Fișier șters cu succes:', absolutePath);
      } catch (error) {
        console.error('Eroare la ștergerea fișierului:', error);
        // Continuăm cu ștergerea din baza de date chiar dacă ștergerea fișierului a eșuat
      }
    }

    // Șterge documentul din baza de date
    await document.update({ status: 'deleted' });
    console.log('Document marcat ca șters în baza de date');

    // Creează notificare pentru utilizator
    await createDocumentNotification(
      document.user_id,
      NOTIFICATION_TYPES.DOCUMENT_DELETED,
      document.document_type,
      document.id,
      { customMessage: admin_message }
    );

    const documents = await Document.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });
    const status = {
      pending: documents.filter(doc => doc.status === 'pending').length,
      approved: documents.filter(doc => doc.status === 'approved').length,
      rejected: documents.filter(doc => doc.status === 'rejected').length
    };
    res.json({ 
      success: true,
      message: 'Document șters cu succes',
      data: documents,
      status
    });
  } catch (error) {
    console.error('Eroare la ștergerea documentului:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la ștergerea documentului',
      error: error.message
    });
  }
});

// Funcție pentru curățarea documentelor orfane
async function cleanupOrphanedDocuments() {
  try {
    console.log('Începe curățarea documentelor orfane...');
    const documents = await Document.findAll();
    console.log('Documente găsite:', documents.length);
    
    let deletedCount = 0;
    for (const doc of documents) {
      const absolutePath = path.resolve(doc.file_path);
      const uploadsDirAbsolute = path.resolve(uploadsDir);
      
      console.log('Verificare document:', {
        id: doc.id,
        file_path: absolutePath,
        exists: fs.existsSync(absolutePath),
        isInUploadsDir: absolutePath.startsWith(uploadsDirAbsolute)
      });
      
      if (!fs.existsSync(absolutePath) || !absolutePath.startsWith(uploadsDirAbsolute)) {
        console.log('Document orfan găsit:', {
          id: doc.id,
          file_path: absolutePath
        });
        await doc.destroy();
        deletedCount++;
        console.log('Document orfan șters:', doc.id);
      }
    }
    console.log('Curățarea documentelor orfane finalizată');
    return {
      success: true,
      deletedCount: deletedCount
    };
  } catch (error) {
    console.error('Eroare la curățarea documentelor orfane:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Endpoint pentru curățarea documentelor
router.post('/cleanup', auth, async (req, res) => {
  try {
    const result = await cleanupOrphanedDocuments();
    
    if (result.success) {
      res.json({
        success: true,
        message: `Documentele orfane au fost curățate cu succes. Au fost șterse ${result.deletedCount} documente.`
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'A apărut o eroare la curățarea documentelor',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Eroare la curățarea documentelor:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la curățarea documentelor',
      error: error.message
    });
  }
});

// Descarcă un document (doar pentru admin)
router.get('/admin/download/:id', auth, adminAuth, async (req, res) => {
  try {
    console.log('Încercare descărcare document (admin):', req.params.id);
    
    const document = await Document.findOne({
      where: { id: req.params.id },
      include: [{
        model: User,
        attributes: ['name', 'email'],
        as: 'user'
      }]
    });

    if (!document) {
      console.log('Document negăsit pentru ID:', req.params.id);
      return res.status(404).json({ message: 'Documentul nu a fost găsit' });
    }

    console.log('Document găsit:', {
      id: document.id,
      file_path: document.file_path,
      exists: fs.existsSync(document.file_path)
    });

    // Verifică dacă calea există și este validă
    const absolutePath = path.join(uploadsDir, document.user_id.toString(), path.basename(document.file_path));
    const uploadsDirAbsolute = path.resolve(uploadsDir);
    
    console.log('Căi:', {
      documentPath: absolutePath,
      uploadsDir: uploadsDirAbsolute,
      isInUploadsDir: absolutePath.startsWith(uploadsDirAbsolute)
    });

    if (!fs.existsSync(absolutePath)) {
      console.log('Fișierul nu există la calea:', absolutePath);
      return res.status(404).json({ message: 'Fișierul nu a fost găsit' });
    }

    if (!absolutePath.startsWith(uploadsDirAbsolute)) {
      console.log('Cale invalidă:', absolutePath);
      return res.status(400).json({ message: 'Cale invalidă' });
    }

    // Setează header-urile pentru descărcare
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(document.originalName)}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // Trimite fișierul
    const fileStream = fs.createReadStream(absolutePath);
    fileStream.on('error', (error) => {
      console.error('Eroare la citirea fișierului:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Eroare la citirea fișierului' });
      }
    });

    fileStream.pipe(res);
  } catch (error) {
    console.error('Eroare la descărcarea documentului:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Eroare la descărcarea documentului' });
    }
  }
});

// Verifică statusul documentelor
router.get('/document-status', auth, async (req, res) => {
  try {
    console.log('Verificare status documente pentru utilizatorul:', req.user.id);
    
    const documents = await Document.findAll({
      where: { user_id: req.user.id },
      attributes: ['id', 'document_type', 'file_path', 'status'],
      include: [{
        model: User,
        attributes: ['name', 'email'],
        as: 'user'
      }]
    });

    const documentStatus = {};
    for (const doc of documents) {
      const absolutePath = path.resolve(doc.file_path);
      const exists = fs.existsSync(absolutePath);
      
      documentStatus[doc.document_type] = {
        exists: exists,
        status: doc.status,
        id: doc.id
      };

      if (!exists && doc.status !== 'deleted') {
        // Actualizăm statusul în baza de date
        await Document.update(
          { status: 'deleted' },
          { where: { id: doc.id } }
        );
      }
    }

    res.json({
      success: true,
      documentStatus
    });
  } catch (error) {
    console.error('Eroare la verificarea statusului documentelor:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la verificarea statusului documentelor',
      error: error.message
    });
  }
});

// Curăță documentele invalide pentru un utilizator
async function cleanupInvalidDocuments(userId) {
  try {
    console.log('Începe curățarea documentelor invalide pentru utilizatorul:', userId);
    
    // Obținem toate documentele din baza de date
    const documents = await Document.findAll({
      where: { user_id: userId },
      include: [{
        model: User,
        attributes: ['name', 'email'],
        as: 'user'
      }]
    });
    
    // Obținem toate fișierele din directorul utilizatorului
    const userDir = path.join(uploadsDir, userId.toString());
    if (!fs.existsSync(userDir)) {
      return {
        success: true,
        message: 'Nu există documente de curățat',
        deletedCount: 0,
        createdCount: 0
      };
    }

    const files = fs.readdirSync(userDir);
    let deletedCount = 0;
    let createdCount = 0;

    // Ștergem documentele invalide din baza de date
    for (const doc of documents) {
      const absolutePath = path.resolve(doc.file_path);
      const exists = fs.existsSync(absolutePath);
      
      if (!exists || doc.status === 'deleted') {
        console.log('Ștergere document invalid:', {
          id: doc.id,
          document_type: doc.document_type,
          file_path: doc.file_path,
          exists: exists,
          status: doc.status
        });
        
        await doc.destroy();
        deletedCount++;
      }
    }

    // Creăm documente pentru fișierele încărcate dar neînregistrate
    for (const file of files) {
      const filePath = path.join(userDir, file);
      const isDirectory = fs.statSync(filePath).isDirectory();
      
      if (!isDirectory) {
        // Verificăm dacă fișierul există deja în baza de date
        const existingDoc = documents.find(doc => 
          path.basename(doc.file_path) === file
        );

        if (!existingDoc) {
          // Determinăm tipul documentului din numele fișierului
          const documentType = determineDocumentType(file);
          
          if (documentType) {
            // Creăm un document nou
            await Document.create({
              user_id: userId,
              document_type: documentType,
              filename: file,
              originalName: file,
              file_path: filePath,
              status: 'pending'
            });
            
            createdCount++;
            console.log('Document creat pentru fișier:', file);
          }
        }
      }
    }
    
    console.log(`Curățare documente finalizată pentru utilizatorul ${userId}. Șterse: ${deletedCount}, Create: ${createdCount}`);
    return {
      success: true,
      deletedCount: deletedCount,
      createdCount: createdCount
    };
  } catch (error) {
    console.error('Eroare la curățarea documentelor:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Funcție helper pentru determinarea tipului documentului
function determineDocumentType(filename) {
  const lowerFilename = filename.toLowerCase();
  
  if (lowerFilename.includes('passport') || lowerFilename.includes('pasaport')) {
    return 'passport';
  } else if (lowerFilename.includes('diploma') || lowerFilename.includes('diplomă')) {
    return 'diploma';
  } else if (lowerFilename.includes('transcript') || lowerFilename.includes('adeverință')) {
    return 'transcript';
  } else if (lowerFilename.includes('cv') || lowerFilename.includes('resume')) {
    return 'cv';
  } else if (lowerFilename.includes('photo') || lowerFilename.includes('poza')) {
    return 'photo';
  } else if (lowerFilename.includes('medical') || lowerFilename.includes('medicală')) {
    return 'medical';
  } else if (lowerFilename.includes('insurance') || lowerFilename.includes('asigurare')) {
    return 'insurance';
  }
  
  return 'other';
}

// Endpoint pentru curățarea documentelor
router.post('/cleanup', auth, async (req, res) => {
  try {
    const result = await cleanupInvalidDocuments(req.user.id);
    
    if (result.success) {
      res.json({
        success: true,
        message: `Documentele invalide au fost curățate cu succes. Au fost șterse ${result.deletedCount} documente.`
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'A apărut o eroare la curățarea documentelor',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Eroare la curățarea documentelor:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la curățarea documentelor',
      error: error.message
    });
  }
});

// Funcție helper pentru crearea notificărilor
async function createDocumentNotification(userId, type, documentType, documentId, additionalInfo = {}) {
  try {
    const messages = {
      [NOTIFICATION_TYPES.DOCUMENT_UPDATED]: `Your ${documentType} document has been updated`,
      [NOTIFICATION_TYPES.DOCUMENT_DELETED]: `Your ${documentType} document has been deleted`,
      [NOTIFICATION_TYPES.DOCUMENT_UPLOADED]: `Your ${documentType} document has been successfully uploaded`,
      [NOTIFICATION_TYPES.DOCUMENT_APPROVED]: `Your ${documentType} document has been approved`,
      [NOTIFICATION_TYPES.DOCUMENT_REJECTED]: `Your ${documentType} document has been rejected`
    };

    const message = additionalInfo.customMessage || messages[type];
    if (!message) {
      throw new Error(`Tip de notificare necunoscut: ${type}`);
    }

    await createNotification(userId, type, message, documentId);
    return true;
  } catch (error) {
    console.error('Eroare la crearea notificării:', error);
    return false;
  }
}

// Adăugare middleware pentru erori la sfârșitul fișierului
router.use(errorHandler);

module.exports = router;