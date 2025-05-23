const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
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
  logger.error('Eroare:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    user: req.user ? req.user.id : 'anonymous'
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Eroare internă a serverului',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Middleware pentru validarea documentelor
const validateDocument = async (req, res, next) => {
  try {
    console.log('Validare document - Request body:', req.body);
    console.log('Validare document - Request file:', req.file);
    
    const { document_type } = req.body;
    
    if (!document_type) {
      console.error('Tipul documentului lipsește din request body');
      throw new Error('Tipul documentului este obligatoriu');
    }

    if (!req.file) {
      console.error('Fișierul lipsește din request');
      throw new Error('Fișierul este obligatoriu');
    }

    const validTypes = ['passport', 'diploma', 'transcript', 'cv', 'other', 'photo', 'medical', 'insurance'];
    if (!validTypes.includes(document_type)) {
      console.error('Tip de document invalid:', document_type);
      throw new Error(`Tip de document invalid. Tipurile valide sunt: ${validTypes.join(', ')}`);
    }

    // Verifică dimensiunea fișierului
    if (req.file.size > 10 * 1024 * 1024) { // 10MB
      console.error('Fișier prea mare:', req.file.size);
      throw new Error('Dimensiunea maximă permisă pentru fișier este de 10MB');
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

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      console.error('Tip de fișier neacceptat:', req.file.mimetype);
      throw new Error('Tip de fișier neacceptat. Folosiți doar PDF, JPG, PNG, DOC, DOCX, XLS sau XLSX.');
    }

    console.log('Document validat cu succes:', {
      document_type,
      file: {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });

    next();
  } catch (error) {
    // Dacă există un fișier încărcat și apare o eroare, îl ștergem
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
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
  destination: function (req, file, cb) {
    // Get user ID
    const userId = req.user.id;
    
    // Create user directory using user ID
    const userDir = path.join(uploadsDir, userId.toString());
    if (!fs.existsSync(userDir)) {
      try {
        fs.mkdirSync(userDir, { recursive: true });
        console.log('Created user directory:', userDir);
      } catch (error) {
        console.error('Error creating user directory:', error);
        return cb(error);
      }
    }
    
    cb(null, userDir);
  },
  filename: function (req, file, cb) {
    // Păstrăm numele original al fișierului
    const originalFilename = file.originalname;
    const userDir = path.join(uploadsDir, req.user.id.toString());
    const filePath = path.join(userDir, originalFilename);
    
    // Verificăm dacă există deja un fișier cu același nume
    if (fs.existsSync(filePath)) {
      // Adăugăm un sufix unic doar dacă există deja un fișier cu același nume
      const fileExtension = path.extname(originalFilename);
      const fileNameWithoutExt = originalFilename.substring(0, originalFilename.length - fileExtension.length);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const newFilename = `${fileNameWithoutExt}-${uniqueSuffix}${fileExtension}`;
      
      console.log('Fișier cu același nume există, se adaugă sufix:', {
        originalName: originalFilename,
        newFilename: newFilename
      });
      
      cb(null, newFilename);
    } else {
      console.log('Păstrare nume original fișier:', {
        originalName: originalFilename
      });
      
      cb(null, originalFilename);
    }
  }
});

// Configurare multer cu validări suplimentare
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  },
  fileFilter: function (req, file, cb) {
    // Verifică tipul de fișier
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    // Verifică extensia fișierului
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx'];
    
    if (!allowedTypes.includes(file.mimetype) || !allowedExtensions.includes(ext)) {
      return cb(new Error('Tip de fișier neacceptat. Folosiți doar PDF, JPG, PNG, DOC, DOCX, XLS sau XLSX.'), false);
    }

    // Verifică numele fișierului pentru caractere periculoase
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    if (sanitizedFilename !== file.originalname) {
      file.originalname = sanitizedFilename;
    }

    cb(null, true);
  }
});

// Middleware pentru rate limiting
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 10, // limită de 10 încărcări per IP
  message: 'Prea multe încărcări de fișiere. Vă rugăm să încercați din nou mai târziu.'
});

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

// Rute pentru documente
router.get('/user-documents', authMiddleware, async (req, res) => {
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

router.get('/:id', authMiddleware, getDocumentById);
router.post('/', authMiddleware, createDocument);
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
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
    await createNotification(
      document.user_id,
      NOTIFICATION_TYPES.DOCUMENT_UPDATED,
      `Documentul dumneavoastră ${document.document_type} a fost actualizat`,
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
router.delete('/:id', authMiddleware, deleteDocument);

// Get all documents (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
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
router.post('/upload', authMiddleware, uploadLimiter, upload.single('file'), validateDocument, async (req, res, next) => {
  try {
    logger.info('Începe încărcarea documentului', {
      userId: req.user.id,
      documentType: req.body.document_type,
      file: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null
    });

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

    const validTypes = ['passport', 'diploma', 'transcript', 'cv', 'other', 'photo', 'medical', 'insurance'];
    
    if (!validTypes.includes(documentType)) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        success: false,
        message: 'Tip de document invalid',
        details: 'Tipul documentului trebuie să fie unul dintre: ' + validTypes.join(', ')
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
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Există deja un document de acest tip',
        details: 'Ștergeți documentul existent înainte de a încărca unul nou'
      });
    }

    // Păstrăm numele original al fișierului
    const originalFilename = req.file.originalname;
    const fileExtension = path.extname(originalFilename);
    const timestamp = Date.now();
    const newFilename = `${documentType}_${timestamp}${fileExtension}`;
    const userDir = path.join(uploadsDir, req.user.id.toString());
    
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    const filePath = path.join(userDir, newFilename);
    fs.renameSync(req.file.path, filePath);

    const document = await Document.create({
      user_id: req.user.id,
      document_type: documentType,
      file_path: filePath,
      filename: newFilename,
      originalName: originalFilename,
      status: 'pending',
      uploaded: true,
      uploadDate: new Date()
    });

    logger.info('Document încărcat cu succes', {
      userId: req.user.id,
      documentId: document.id,
      documentType: document.document_type,
      filePath: filePath
    });

    res.json({
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
    logger.error('Eroare la încărcarea documentului', {
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
      documentType: req.body.document_type
    });

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    next(error);
  }
});

// Obține toate documentele unui utilizator
router.get('/my-documents', authMiddleware, async (req, res) => {
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
router.get('/all-documents', authMiddleware, adminMiddleware, async (req, res) => {
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
router.get('/download/:id', authMiddleware, checkPermissions, async (req, res, next) => {
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

    // Trimite fișierul în chunks pentru optimizare
    const fileStream = fs.createReadStream(filePath, { highWaterMark: 64 * 1024 }); // 64KB chunks
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      logger.error('Eroare la trimiterea fișierului:', {
        error: error.message,
        documentId: document.id
      });
      next(error);
    });
  } catch (error) {
    next(error);
  }
});

// Șterge un document
router.delete('/:id', authMiddleware, checkPermissions, async (req, res, next) => {
  try {
    console.log('Încercare ștergere document:', req.params.id);
    
    // Construiește calea către fișier
    const userDir = path.join(uploadsDir, req.document.user_id.toString());
    const absolutePath = path.join(userDir, path.basename(req.document.file_path));
    
    console.log('Căi pentru ștergere:', {
      userDir,
      absolutePath,
      fileExists: fs.existsSync(absolutePath)
    });

    // Verifică dacă directorul utilizatorului există
    if (!fs.existsSync(userDir)) {
      console.log('Directorul utilizatorului nu există:', userDir);
      // Șterge documentul din baza de date chiar dacă directorul nu există
      await req.document.destroy();
      return res.json({ 
        success: true,
        message: 'Document șters din baza de date (directorul nu exista)' 
      });
    }

    // Verifică dacă fișierul există
    if (!fs.existsSync(absolutePath)) {
      console.log('Fișierul nu există la calea:', absolutePath);
      // Șterge documentul din baza de date chiar dacă fișierul nu există
      await req.document.destroy();
      return res.json({ 
        success: true,
        message: 'Document șters din baza de date (fișierul nu exista)' 
      });
    }

    // Încearcă să șteargă fișierul
    try {
      fs.unlinkSync(absolutePath);
      console.log('Fișier șters cu succes:', absolutePath);
    } catch (error) {
      console.error('Eroare la ștergerea fișierului:', error);
      // Continuă cu ștergerea din baza de date chiar dacă ștergerea fișierului a eșuat
    }

    // Șterge documentul din baza de date
    await req.document.destroy();
    console.log('Document șters din baza de date');

    // Creează notificare pentru utilizator dacă documentul a fost șters de administrator
    if (req.user.role === 'admin' && req.document.user_id !== req.user.id) {
      const adminMessage = req.body.admin_message || 'Documentul a fost șters de către administrator';
      await createNotification(
        req.document.user_id,
        NOTIFICATION_TYPES.DOCUMENT_DELETED,
        `Documentul tău de tip ${req.document.document_type} a fost șters de către administrator`,
        req.document.id,
        adminMessage
      );
      console.log('Notificare creată pentru utilizator:', req.document.user_id);
    }

    res.json({ 
      success: true,
      message: 'Document șters cu succes' 
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

// Șterge un document (doar pentru admin)
router.delete('/admin/:id', authMiddleware, adminMiddleware, async (req, res) => {
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
    await createNotification(
      document.user_id,
      NOTIFICATION_TYPES.DOCUMENT_DELETED,
      `Documentul tău de tip ${document.document_type} a fost șters de către administrator`,
      document.id
    );

    res.json({ 
      success: true,
      message: 'Document șters cu succes' 
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
router.post('/cleanup', authMiddleware, async (req, res) => {
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
router.get('/admin/download/:id', authMiddleware, adminMiddleware, async (req, res) => {
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
router.get('/document-status', authMiddleware, async (req, res) => {
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
router.post('/cleanup', authMiddleware, async (req, res) => {
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

// Adăugare middleware pentru erori la sfârșitul fișierului
router.use(errorHandler);

module.exports = router;