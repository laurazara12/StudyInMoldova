const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { User, Document } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

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
    console.log('Începe preluarea documentelor pentru utilizatorul:', req.user.id);
    console.log('Rol utilizator:', req.user.role);
    
    // Dacă utilizatorul este admin, returnează toate documentele
    if (req.user.role === 'admin') {
      console.log('Utilizator admin, se preiau toate documentele');
      try {
        const documents = await Document.findAll({
          attributes: ['id', 'user_id', 'document_type', 'file_path', 'createdAt', 'status', 'filename', 'originalName'],
          order: [['createdAt', 'DESC']],
          include: [{
            model: User,
            attributes: ['name', 'email'],
            as: 'user'
          }]
        });
        
        console.log('Documente găsite pentru admin:', documents.length);
        return res.json(documents.map(doc => ({
          id: doc.id,
          user_id: doc.user_id,
          user_name: doc.user ? doc.user.name : 'Unknown',
          user_email: doc.user ? doc.user.email : 'Unknown',
          document_type: doc.document_type,
          file_path: doc.file_path,
          createdAt: doc.createdAt,
          status: doc.status || 'pending',
          filename: doc.filename,
          originalName: doc.originalName,
          uploaded: true,
          uploadDate: doc.createdAt
        })));
      } catch (error) {
        console.error('Eroare la interogarea documentelor pentru admin:', error);
        throw error;
      }
    }
    
    // Pentru utilizatori normali, returnează doar propriile documente
    console.log('Utilizator normal, se preiau doar documentele sale');
    try {
      const documents = await Document.findAll({
        where: { user_id: req.user.id },
        attributes: ['id', 'document_type', 'file_path', 'createdAt', 'status', 'filename', 'originalName'],
        order: [['createdAt', 'DESC']],
        include: [{
          model: User,
          attributes: ['name', 'email'],
          as: 'user'
        }]
      });

      console.log('Documente găsite pentru utilizator:', documents.length);
      res.json(documents.map(doc => ({
        id: doc.id,
        document_type: doc.document_type,
        file_path: doc.file_path,
        createdAt: doc.createdAt,
        status: doc.status || 'pending',
        filename: doc.filename,
        originalName: doc.originalName,
        uploaded: true,
        uploadDate: doc.createdAt
      })));
    } catch (error) {
      console.error('Eroare la interogarea documentelor pentru utilizator:', error);
      throw error;
    }
  } catch (error) {
    console.error('Eroare detaliată la preluarea documentelor:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });
    res.status(500).json({ 
      success: false,
      message: 'Eroare la preluarea documentelor',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get user documents
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
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        attributes: ['name', 'email'],
        as: 'user'
      }]
    });

    console.log('Documente găsite în baza de date:', documents.length);

    const validDocuments = documents.filter(doc => {
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

      console.log('Verificare document:', {
        id: doc.id,
        document_type: doc.document_type,
        originalPath: doc.file_path,
        absolutePath: absolutePath
      });

      const exists = fs.existsSync(absolutePath);
      if (!exists) {
        console.log(`Document ${doc.id} nu există fizic la calea ${absolutePath}`);
        // Actualizează statusul documentului ca fiind șters
        Document.update(
          { status: 'deleted' },
          { where: { id: doc.id } }
        ).catch(err => console.error('Eroare la actualizarea statusului documentului:', err));
        return false;
      }
      return true;
    });

    console.log('Documente valide găsite:', validDocuments.length);
    
    const response = validDocuments.map(doc => ({
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

    console.log('Se trimite răspuns cu documentele valide');
    res.json(response);
  } catch (error) {
    console.error('Eroare detaliată la preluarea documentelor:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      success: false,
      message: 'Eroare la preluarea documentelor',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Upload document
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    console.log('=== Începe încărcarea documentului ===');
    console.log('Request body complet:', JSON.stringify(req.body, null, 2));
    console.log('Request file detaliat:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      encoding: req.file.encoding,
      mimetype: req.file.mimetype,
      destination: req.file.destination,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size
    } : 'Nu există fișier');
    console.log('User detaliat:', req.user ? {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    } : 'Nu există utilizator');

    if (!req.file) {
      console.log('EROARE: Nu s-a încărcat niciun fișier');
      return res.status(400).json({ 
        success: false,
        message: 'Nu s-a încărcat niciun fișier',
        details: 'Este necesar să încărcați un fișier'
      });
    }

    // Verificăm dacă tipul documentului este trimis în FormData
    const documentType = req.body.document_type;
    console.log('Tip document primit:', documentType);
    console.log('Toate cheile din request body:', Object.keys(req.body));
    
    if (!documentType) {
      console.log('EROARE: Tipul documentului lipsește');
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
    const validTypes = ['passport', 'diploma', 'transcript', 'cv', 'other', 'photo', 'medical', 'insurance'];
    console.log('Tipuri valide:', validTypes);
    console.log('Tip document verificat:', documentType);
    
    if (!validTypes.includes(documentType)) {
      console.log('EROARE: Tip de document invalid:', documentType);
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
      console.log('EROARE: Fișierul nu există la calea:', req.file.path);
      return res.status(500).json({ 
        success: false,
        message: 'Eroare la încărcarea fișierului',
        details: 'Fișierul nu a fost salvat corect'
      });
    }

    // Verifică permisiunile de scriere
    try {
      fs.accessSync(req.file.path, fs.constants.W_OK);
    } catch (error) {
      console.log('EROARE: Permisiuni fișier:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Eroare permisiuni fișier',
        details: 'Nu există permisiuni de scriere pentru fișier'
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
        document_type: documentType 
      }
    });

    if (existingDocument) {
      console.log('Document existent găsit, se actualizează...');
      // Șterge fișierul vechi
      if (fs.existsSync(existingDocument.file_path)) {
        fs.unlinkSync(existingDocument.file_path);
        console.log('Fișier vechi șters:', existingDocument.file_path);
      }
      
      // Actualizează documentul existent
      await existingDocument.update({
        file_path: req.file.path,
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
      document_type: documentType,
      filename: req.file.filename,
      originalName: req.file.originalname,
      file_path: req.file.path,
      status: 'pending'
    });

    console.log('Document creat cu succes:', document);
    return res.status(201).json({
      success: true,
      message: 'Document încărcat cu succes',
      document: document
    });
  } catch (error) {
    console.error('EROARE DETALIATĂ:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });
    // Șterge fișierul temporar în caz de eroare
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ 
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

// Șterge un document
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('Încercare ștergere document:', req.params.id);
    
    const document = await Document.findOne({
      where: { id: req.params.id, user_id: req.user.id },
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
        message: 'Documentul nu a fost găsit',
        details: 'Documentul cu ID-ul specificat nu există în baza de date'
      });
    }

    console.log('Document găsit:', {
      id: document.id,
      file_path: document.file_path,
      exists: fs.existsSync(document.file_path)
    });

    // Verifică dacă calea există și este validă
    const absolutePath = path.resolve(document.file_path);
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
    const absolutePath = path.resolve(document.file_path);
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
        console.log('Document orfan șters:', doc.id);
      }
    }
    console.log('Curățarea documentelor orfane finalizată');
  } catch (error) {
    console.error('Eroare la curățarea documentelor orfane:', error);
  }
}

// Endpoint pentru curățarea documentelor
router.post('/cleanup', authMiddleware, async (req, res) => {
  try {
    const success = await cleanupOrphanedDocuments();
    
    if (success) {
      res.json({
        success: true,
        message: 'Documentele orfane au fost curățate cu succes'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'A apărut o eroare la curățarea documentelor'
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

// Download document
router.get('/download/:id', authMiddleware, async (req, res) => {
  try {
    console.log('Încercare descărcare document:', req.params.id);
    
    const document = await Document.findOne({
      where: { id: req.params.id, user_id: req.user.id },
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
        message: 'Documentul nu a fost găsit',
        details: 'Documentul cu ID-ul specificat nu există în baza de date'
      });
    }

    console.log('Document găsit:', {
      id: document.id,
      file_path: document.file_path,
      exists: fs.existsSync(document.file_path)
    });

    // Verifică dacă calea există și este validă
    const absolutePath = path.resolve(document.file_path);
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
    const absolutePath = path.resolve(document.file_path);
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
    
    const documents = await Document.findAll({
      where: { user_id: userId },
      include: [{
        model: User,
        attributes: ['name', 'email'],
        as: 'user'
      }]
    });
    
    let deletedCount = 0;
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
        
        // Șterge fișierul fizic dacă există
        if (exists) {
          try {
            fs.unlinkSync(absolutePath);
            console.log('Fișier șters:', absolutePath);
          } catch (error) {
            console.error('Eroare la ștergerea fișierului:', error);
          }
        }
        
        await doc.destroy();
        deletedCount++;
      }
    }
    
    console.log(`Curățare documente finalizată pentru utilizatorul ${userId}. Șterse: ${deletedCount}`);
    return {
      success: true,
      deletedCount: deletedCount
    };
  } catch (error) {
    console.error('Eroare la curățarea documentelor:', error);
    return {
      success: false,
      error: error.message
    };
  }
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

module.exports = router;