const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { User, Document } = require('../config/database');

const router = express.Router();

// Verificăm și creăm directorul uploads dacă nu există
const uploadsDir = path.join(__dirname, '../../backend/uploads');
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
      fs.mkdirSync(userDir, { recursive: true });
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

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
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
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Tip de fișier neacceptat. Folosiți doar PDF, JPG, PNG, DOC, DOCX, XLS sau XLSX.'), false);
    }
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
      attributes: ['id', 'type', 'path', 'createdAt', 'status', 'filename', 'originalName'],
      order: [['createdAt', 'DESC']]
    });

    console.log('Documents found:', documents.length);
    res.json(documents.map(doc => ({
      id: doc.id,
      document_type: doc.type,
      file_path: doc.path,
      created_at: doc.createdAt,
      status: doc.status || 'pending',
      filename: doc.filename,
      originalName: doc.originalName,
      uploaded: true,
      uploadDate: doc.createdAt
    })));
  } catch (error) {
    console.error('Error retrieving documents:', error);
    res.status(500).json({ message: 'Error retrieving documents', error: error.message });
  }
});

// Upload document
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    console.log('Încărcare document nou...');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('User:', req.user);

    if (!req.file) {
      console.log('Nu s-a încărcat niciun fișier');
      return res.status(400).json({ 
        success: false,
        message: 'Nu s-a încărcat niciun fișier',
        details: 'Este necesar să încărcați un fișier'
      });
    }

    const { document_type } = req.body;
    
    if (!document_type) {
      console.log('Tipul documentului lipsește');
      // Șterge fișierul temporar
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        success: false,
        message: 'Tipul documentului este obligatoriu',
        details: 'Specificați tipul documentului în câmpul document_type'
      });
    }

    // Verifică dacă tipul documentului este valid
    const validTypes = ['passport', 'diploma', 'transcript', 'cv', 'other'];
    if (!validTypes.includes(document_type)) {
      console.log('Tip de document invalid:', document_type);
      // Șterge fișierul temporar
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        success: false,
        message: 'Tip de document invalid',
        details: 'Tipul documentului trebuie să fie unul dintre: ' + validTypes.join(', ')
      });
    }

    // Verifică dacă fișierul există
    if (!fs.existsSync(req.file.path)) {
      console.log('Fișierul nu există la calea:', req.file.path);
      return res.status(500).json({ 
        success: false,
        message: 'Eroare la încărcarea fișierului',
        details: 'Fișierul nu a fost salvat corect'
      });
    }

    // Păstrăm numele original al fișierului
    const originalFilename = req.file.originalname;
    const newPath = path.join(path.dirname(req.file.path), originalFilename);
    
    console.log('Redenumire fișier:', {
      oldPath: req.file.path,
      newPath: newPath
    });
    
    fs.renameSync(req.file.path, newPath);
    req.file.path = newPath;
    req.file.filename = originalFilename;

    // Verifică dacă există deja un document de acest tip
    const existingDocument = await Document.findOne({
      where: { 
        user_id: req.user.id,
        type: document_type 
      }
    });

    if (existingDocument) {
      console.log('Document existent găsit, se actualizează...');
      // Șterge fișierul vechi
      if (fs.existsSync(existingDocument.path)) {
        fs.unlinkSync(existingDocument.path);
        console.log('Fișier vechi șters:', existingDocument.path);
      }
      
      // Actualizează documentul existent
      await existingDocument.update({
        path: req.file.path,
        status: 'pending',
        filename: req.file.filename,
        originalName: req.file.originalname
      });
      
      console.log('Document actualizat cu succes');
      return res.json({ 
        success: true,
        message: 'Document actualizat cu succes',
        document: existingDocument
      });
    }

    // Creează un document nou
    console.log('Se creează document nou...');
    const document = await Document.create({
      user_id: req.user.id,
      type: document_type,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      status: 'pending'
    });

    console.log('Document creat cu succes:', document);
    return res.status(201).json({
      success: true,
      message: 'Document încărcat cu succes',
      document: document
    });
  } catch (error) {
    console.error('Eroare la încărcarea documentului:', error);
    // Șterge fișierul temporar în caz de eroare
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ 
      success: false,
      message: 'Eroare la încărcarea documentului',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Obține toate documentele unui utilizator
router.get('/my-documents', authMiddleware, async (req, res) => {
  try {
    const documents = await Document.findAll({
      where: { user_id: req.user.id },
      attributes: ['id', 'user_id', 'document_type', 'file_path', 'created_at'],
      order: [['created_at', 'DESC']]
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
      attributes: ['id', 'user_id', 'document_type', 'file_path', 'created_at'],
      order: [['created_at', 'DESC']]
    });

    res.json(documents);
  } catch (error) {
    console.error('Eroare la obținerea documentelor:', error);
    res.status(500).json({ message: 'Eroare la obținerea documentelor' });
  }
});

// Șterge un document
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('Încercare ștergere document:', req.params.id);
    
    const document = await Document.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!document) {
      console.log('Document negăsit pentru ID:', req.params.id);
      return res.status(404).json({ 
        success: false,
        message: 'Documentul nu a fost găsit',
        details: 'Documentul cu ID-ul specificat nu există în baza de date'
      });
    }

    console.log('Document găsit:', {
      id: document.id,
      path: document.path,
      exists: fs.existsSync(document.path)
    });

    // Verifică dacă calea există și este validă
    const absolutePath = path.resolve(document.path);
    const uploadsDirAbsolute = path.resolve(uploadsDir);
    
    console.log('Căi:', {
      documentPath: absolutePath,
      uploadsDir: uploadsDirAbsolute,
      isInUploadsDir: absolutePath.startsWith(uploadsDirAbsolute)
    });

    // Șterge fișierul
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
        console.log('Fișier șters cu succes:', absolutePath);
      } catch (error) {
        console.error('Eroare la ștergerea fișierului:', error);
        return res.status(500).json({ 
          success: false,
          message: 'Eroare la ștergerea fișierului',
          error: error.message
        });
      }
    } else {
      console.log('Fișierul nu există la calea:', absolutePath);
    }

    // Șterge documentul din baza de date
    await document.destroy();
    console.log('Document șters din baza de date');

    res.json({ 
      success: true,
      message: 'Document șters cu succes',
      details: 'Documentul și fișierul asociat au fost șterse cu succes'
    });
  } catch (error) {
    console.error('Eroare la ștergerea documentului:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la ștergerea documentului',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Șterge un document (doar pentru admin)
router.delete('/admin/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    console.log('Încercare ștergere document (admin):', req.params.id);
    
    const document = await Document.findOne({
      where: { id: req.params.id }
    });

    if (!document) {
      console.log('Document negăsit pentru ID:', req.params.id);
      return res.status(404).json({ message: 'Documentul nu a fost găsit' });
    }

    console.log('Document găsit:', {
      id: document.id,
      path: document.path,
      exists: fs.existsSync(document.path)
    });

    // Verifică dacă calea există și este validă
    const absolutePath = path.resolve(document.path);
    const uploadsDirAbsolute = path.resolve(uploadsDir);
    
    console.log('Căi:', {
      documentPath: absolutePath,
      uploadsDir: uploadsDirAbsolute,
      isInUploadsDir: absolutePath.startsWith(uploadsDirAbsolute)
    });

    // Șterge fișierul
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
        console.log('Fișier șters cu succes:', absolutePath);
      } catch (error) {
        console.error('Eroare la ștergerea fișierului:', error);
        return res.status(500).json({ message: 'Eroare la ștergerea fișierului' });
      }
    } else {
      console.log('Fișierul nu există la calea:', absolutePath);
    }

    // Șterge documentul din baza de date
    await document.destroy();
    console.log('Document șters din baza de date');

    res.json({ message: 'Document șters cu succes' });
  } catch (error) {
    console.error('Eroare la ștergerea documentului:', error);
    res.status(500).json({ message: 'Eroare la ștergerea documentului' });
  }
});

// Funcție pentru curățarea documentelor orfane
async function cleanupOrphanedDocuments() {
  try {
    console.log('Începe curățarea documentelor orfane...');
    const documents = await Document.findAll();
    console.log('Documente găsite:', documents.length);
    
    for (const doc of documents) {
      const absolutePath = path.resolve(doc.path);
      const uploadsDirAbsolute = path.resolve(uploadsDir);
      
      console.log('Verificare document:', {
        id: doc.id,
        path: absolutePath,
        exists: fs.existsSync(absolutePath),
        isInUploadsDir: absolutePath.startsWith(uploadsDirAbsolute)
      });
      
      if (!fs.existsSync(absolutePath) || !absolutePath.startsWith(uploadsDirAbsolute)) {
        console.log('Document orfan găsit:', {
          id: doc.id,
          path: absolutePath
        });
        await doc.destroy();
        console.log('Document orfan șters:', doc.id);
      }
    }
    console.log('Curățarea documentelor orfane finalizată');
  } catch (error) {
    console.error('Eroare la curățarea documentelor orfane:', error);
  }
}

// Download document
router.get('/download/:id', authMiddleware, async (req, res) => {
  try {
    console.log('Încercare descărcare document:', req.params.id);
    
    const document = await Document.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!document) {
      console.log('Document negăsit pentru ID:', req.params.id);
      return res.status(404).json({ 
        success: false,
        message: 'Documentul nu a fost găsit',
        details: 'Documentul cu ID-ul specificat nu există în baza de date'
      });
    }

    console.log('Document găsit:', {
      id: document.id,
      path: document.path,
      exists: fs.existsSync(document.path)
    });

    // Verifică dacă calea există și este validă
    const absolutePath = path.resolve(document.path);
    const uploadsDirAbsolute = path.resolve(uploadsDir);
    
    console.log('Căi:', {
      documentPath: absolutePath,
      uploadsDir: uploadsDirAbsolute,
      isInUploadsDir: absolutePath.startsWith(uploadsDirAbsolute)
    });

    if (!fs.existsSync(absolutePath)) {
      console.log('Fișierul nu există la calea:', absolutePath);
      // Șterge înregistrarea din baza de date dacă fișierul nu există
      await document.destroy();
      return res.status(404).json({ 
        success: false,
        message: 'Fișierul nu a fost găsit',
        details: 'Fișierul fizic nu există pe server'
      });
    }

    if (!absolutePath.startsWith(uploadsDirAbsolute)) {
      console.log('Cale invalidă:', absolutePath);
      return res.status(400).json({ 
        success: false,
        message: 'Cale invalidă',
        details: 'Calea fișierului nu este în directorul uploads'
      });
    }

    // Setează header-urile pentru descărcare
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(document.originalName)}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // Trimite fișierul
    const fileStream = fs.createReadStream(absolutePath);
    fileStream.on('error', (error) => {
      console.error('Eroare la citirea fișierului:', error);
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false,
          message: 'Eroare la citirea fișierului',
          error: error.message
        });
      }
    });

    fileStream.pipe(res);
  } catch (error) {
    console.error('Eroare la descărcarea documentului:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false,
        message: 'Eroare la descărcarea documentului',
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
});

// Descarcă un document (doar pentru admin)
router.get('/admin/download/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    console.log('Încercare descărcare document (admin):', req.params.id);
    
    const document = await Document.findOne({
      where: { id: req.params.id }
    });

    if (!document) {
      console.log('Document negăsit pentru ID:', req.params.id);
      return res.status(404).json({ message: 'Documentul nu a fost găsit' });
    }

    console.log('Document găsit:', {
      id: document.id,
      path: document.path,
      exists: fs.existsSync(document.path)
    });

    // Verifică dacă calea există și este validă
    const absolutePath = path.resolve(document.path);
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

module.exports = router;