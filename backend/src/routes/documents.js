const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { authMiddleware } = require('../middleware/auth');
const { User, Document } = require('../config/database');

const router = express.Router();

// Verificăm și creăm directorul uploads dacă nu există
const uploadsDir = path.join(__dirname, '../../uploads');
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
  destination: async function (req, file, cb) {
    console.log('Starting file save process...');
    console.log('User data:', req.user);
    
    try {
      // Get user UUID
      const user = await User.findOne({
        where: { id: req.user.id },
        attributes: ['uuid']
      });

      if (!user || !user.uuid) {
        console.error('User UUID not found');
        return cb(new Error('User UUID not found'));
      }

      // Create user directory using UUID
      const userDir = path.join(uploadsDir, user.uuid);
      console.log('User directory path:', userDir);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
        console.log('User directory created:', userDir);
      }
      
      cb(null, userDir);
    } catch (error) {
      console.error('Error in destination handler:', error);
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    try {
      console.log('File data received:', file);
      const documentType = req.body.documentType || 'unknown';
      const userData = req.user || {};
      const userName = userData.name || 'unknown';
      
      const originalName = file.originalname;
      const fileExtension = path.extname(originalName);
      const fileName = `${documentType}_${userName}${fileExtension}`;
      
      console.log('Generated filename:', fileName);
      cb(null, fileName);
    } catch (error) {
      console.error('Error generating filename:', error);
      cb(error);
    }
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    cb(null, true);
  }
});

// Get all documents (for admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('Retrieving all documents');
    console.log('Current user:', req.user);

    if (!req.user || req.user.role !== 'admin') {
      console.log('Access denied - user is not admin:', req.user);
      return res.status(403).json({ 
        message: 'Access denied. Only administrators can access this page.' 
      });
    }
    
    const documents = await Document.findAll({
      attributes: ['id', 'user_id', 'user_uuid', 'document_type', 'file_path', 'created_at'],
      order: [['created_at', 'DESC']],
      include: [{
        model: User,
        attributes: ['name', 'email'],
        as: 'user'
      }]
    });

    console.log('Documents found:', documents.length);
    res.json(documents);
  } catch (error) {
    console.error('Error retrieving documents:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user documents
router.get('/user-documents', authMiddleware, async (req, res) => {
  try {
    console.log('Retrieving documents for user:', req.user.id);
    
    const documents = await Document.findAll({
      where: { user_id: req.user.id },
      attributes: ['id', 'document_type', 'file_path', 'created_at'],
      order: [['created_at', 'DESC']]
    });

    console.log('Documents found:', documents.length);
    res.json(documents.map(doc => ({
      id: doc.id,
      document_type: doc.document_type,
      file_path: doc.file_path,
      created_at: doc.created_at,
      uploaded: true
    })));
  } catch (error) {
    console.error('Error retrieving documents:', error);
    res.status(500).json({ message: error.message });
  }
});

// Upload document
router.post('/upload', authMiddleware, upload.single('document'), async (req, res) => {
  try {
    console.log('Starting upload process...');
    console.log('Request data:', {
      userId: req.user.id,
      documentType: req.body.documentType,
      hasFile: !!req.file,
      file: req.file,
      body: req.body
    });

    if (!req.file) {
      console.log('No file found in request');
      return res.status(400).json({ message: 'No file found' });
    }

    const documentType = req.body.documentType;
    if (!documentType) {
      console.log('Document type is missing');
      return res.status(400).json({ message: 'Document type is required' });
    }

    if (!fs.existsSync(req.file.path)) {
      console.error('File was not saved at path:', req.file.path);
      return res.status(500).json({ message: 'File was not saved correctly' });
    }

    // Get user UUID
    const user = await User.findOne({
      where: { id: req.user.id },
      attributes: ['uuid']
    });

    if (!user || !user.uuid) {
      console.error('User UUID not found');
      return res.status(500).json({ message: 'User UUID not found' });
    }

    // Check if document already exists
    let document = await Document.findOne({
      where: {
        user_id: req.user.id,
        document_type: documentType
      }
    });

    const filePath = req.file.path;
    console.log('File saved at:', filePath);

    if (document) {
      // Update existing document
      document = await document.update({
        file_path: filePath,
        created_at: new Date()
      });
      console.log('Document updated successfully');
      res.json({ 
        message: 'Document updated successfully',
        document: {
          id: document.id,
          documentType,
          filePath,
          created_at: document.created_at
        }
      });
    } else {
      // Create new document
      document = await Document.create({
        user_id: req.user.id,
        user_uuid: user.uuid,
        document_type: documentType,
        file_path: filePath,
        created_at: new Date()
      });
      console.log('Document created successfully');
      res.json({ 
        message: 'Document uploaded successfully',
        document: {
          id: document.id,
          documentType,
          filePath,
          created_at: document.created_at
        }
      });
    }
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ message: error.message });
  }
});

// Ruta pentru ștergerea documentelor
router.delete('/:type', authMiddleware, async (req, res) => {
  try {
    const { type } = req.params;
    const { message } = req.body; // Mesajul opțional pentru notificare

    // Verifică dacă utilizatorul este admin
    const user = await User.findOne({
      where: { uuid: req.user.uuid },
      attributes: ['role']
    });
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Acces interzis' });
    }

    // Șterge documentul
    await Document.destroy({
      where: {
        document_type: type,
        user_uuid: req.user.uuid
      }
    });

    // Adaugă notificare pentru utilizator
    const notificationMessage = message || `Documentul de tip ${type} a fost șters de către administrator.`;
    await User.update(
      {
        last_notification: new Date()
      },
      {
        where: { uuid: req.user.uuid }
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Eroare la ștergerea documentului:', error);
    res.status(500).json({ message: 'Eroare la ștergerea documentului' });
  }
});

// Ruta pentru descărcarea documentelor
router.get('/download/:documentType', authMiddleware, async (req, res) => {
  try {
    const { documentType } = req.params;
    const userId = req.user?.id;

    console.log('Cerere de descărcare primită:', {
      documentType,
      userId,
      user: req.user
    });

    if (!userId) {
      console.error('Utilizator neautentificat');
      return res.status(401).json({ 
        success: false, 
        message: 'Utilizator neautentificat' 
      });
    }

    // Obținem UUID-ul utilizatorului
    const user = await User.findOne({
      where: { id: userId },
      attributes: ['uuid']
    });

    if (!user || !user.uuid) {
      console.error('UUID-ul utilizatorului nu a fost găsit');
      return res.status(500).json({ 
        success: false, 
        message: 'UUID-ul utilizatorului nu a fost găsit' 
      });
    }

    // Găsim documentul în baza de date
    const document = await Document.findOne({
      where: {
        user_id: userId,
        document_type: documentType
      },
      attributes: ['file_path']
    });

    if (!document) {
      console.log('Documentul nu a fost găsit în baza de date');
      return res.status(404).json({ 
        success: false, 
        message: 'Documentul nu a fost găsit' 
      });
    }

    console.log('Calea fișierului:', document.file_path);

    // Verificăm dacă fișierul există
    if (!fs.existsSync(document.file_path)) {
      console.error('Fișierul nu există la calea:', document.file_path);
      return res.status(404).json({ 
        success: false, 
        message: 'Fișierul nu a fost găsit' 
      });
    }

    // Verificăm permisiunile fișierului
    try {
      fs.accessSync(document.file_path, fs.constants.R_OK);
    } catch (error) {
      console.error('Nu avem permisiuni de citire pentru fișier:', error);
      return res.status(403).json({
        success: false,
        message: 'Nu avem acces la fișier'
      });
    }

    // Setăm header-ele pentru descărcare
    const fileExtension = path.extname(document.file_path);
    let contentType = 'application/octet-stream';
    
    // Determinăm content type-ul corect bazat pe extensia fișierului
    switch (fileExtension.toLowerCase()) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.doc':
      case '.docx':
        contentType = 'application/msword';
        break;
      case '.xls':
      case '.xlsx':
        contentType = 'application/vnd.ms-excel';
        break;
      default:
        contentType = 'application/octet-stream';
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(document.file_path)}"`);

    // Trimitem fișierul
    fs.createReadStream(document.file_path)
      .on('error', (error) => {
        console.error('Eroare la citirea fișierului:', error);
        if (!res.headersSent) {
          res.status(500).json({ 
            success: false, 
            message: 'Eroare la citirea fișierului' 
          });
        }
      })
      .pipe(res)
      .on('error', (error) => {
        console.error('Eroare la trimiterea răspunsului:', error);
      })
      .on('finish', () => {
        console.log('Fișier trimis cu succes');
      });

  } catch (error) {
    console.error('Eroare la procesarea cererii de descărcare:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        message: 'Eroare internă server' 
      });
    }
  }
});

module.exports = router;