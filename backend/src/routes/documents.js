const express = require('express');
const multer = require('multer');
const fs = require('fs');
const db = require('../config/database');
const path = require('path');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Verificăm și creăm directorul uploads dacă nu există
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Directorul uploads a fost creat:', uploadsDir);
  } catch (error) {
    console.error('Eroare la crearea directorului uploads:', error);
  }
}

// Configurare multer pentru încărcarea fișierelor
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('Începem procesul de salvare a fișierului...');
    console.log('Date utilizator:', req.user);
    
    // Obținem UUID-ul utilizatorului
    db.get('SELECT uuid FROM users WHERE id = ?', [req.user.id], (err, user) => {
      if (err) {
        console.error('Eroare la obținerea UUID-ului utilizatorului:', err);
        return cb(err);
      }

      console.log('Date utilizator găsite:', user);

      if (!user || !user.uuid) {
        console.error('UUID-ul utilizatorului nu a fost găsit');
        return cb(new Error('UUID-ul utilizatorului nu a fost găsit'));
      }

      // Creăm un director pentru utilizator folosind UUID-ul scurt
      const userDir = path.join(uploadsDir, user.uuid);
      console.log('Calea directorului utilizatorului:', userDir);
      
      // Creăm directorul dacă nu există
      if (!fs.existsSync(userDir)) {
        try {
          fs.mkdirSync(userDir, { recursive: true });
          console.log('Directorul utilizatorului a fost creat:', userDir);
        } catch (error) {
          console.error('Eroare la crearea directorului utilizatorului:', error);
          return cb(error);
        }
      }
      
      cb(null, userDir);
    });
  },
  filename: function (req, file, cb) {
    try {
      console.log('Date fișier primit:', file);
      const documentType = req.body.documentType || 'unknown';
      const userData = req.user || {};
      const userName = userData.name || 'unknown';
      
      // Păstrăm numele și extensia originală a fișierului
      const originalName = file.originalname;
      const fileExtension = path.extname(originalName);
      const fileName = `${documentType}_${userName}${fileExtension}`;
      
      console.log('Numele fișierului generat:', fileName);
      cb(null, fileName);
    } catch (error) {
      console.error('Eroare la generarea numelui fișierului:', error);
      cb(error);
    }
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // limită de 5MB
  },
  fileFilter: function (req, file, cb) {
    // Acceptăm toate tipurile de fișiere
    cb(null, true);
  }
});

// Ruta pentru obținerea documentelor utilizatorului
router.get('/user-documents', authMiddleware, (req, res) => {
  try {
    console.log('Preluare documente pentru utilizatorul:', req.user.id);
    
    db.all('SELECT * FROM documents WHERE user_id = ?', [req.user.id], (err, documents) => {
      if (err) {
        console.error('Eroare la preluarea documentelor:', err);
        return res.status(500).json({ message: 'Eroare la preluarea documentelor' });
      }

      console.log('Documente găsite:', documents.length);
      res.json({
        success: true,
        documents: documents.map(doc => ({
          id: doc.id,
          document_type: doc.document_type,
          file_path: doc.file_path,
          created_at: doc.created_at,
          uploaded: true
        }))
      });
    });
  } catch (error) {
    console.error('Eroare la preluarea documentelor:', error);
    res.status(500).json({ message: error.message });
  }
});

// Ruta pentru încărcarea documentelor
router.post('/upload', authMiddleware, upload.single('document'), async (req, res) => {
  try {
    console.log('Începem procesul de upload...');
    console.log('Date request:', {
      userId: req.user.id,
      documentType: req.body.documentType,
      hasFile: !!req.file,
      file: req.file,
      body: req.body
    });

    if (!req.file) {
      console.log('Nu s-a găsit niciun fișier în request');
      return res.status(400).json({ message: 'Nu s-a găsit niciun fișier' });
    }

    const documentType = req.body.documentType;
    if (!documentType) {
      console.log('Tipul documentului lipsește');
      return res.status(400).json({ message: 'Tipul documentului este obligatoriu' });
    }

    // Verificăm dacă fișierul a fost salvat corect
    if (!fs.existsSync(req.file.path)) {
      console.error('Fișierul nu a fost salvat la calea:', req.file.path);
      return res.status(500).json({ message: 'Fișierul nu a fost salvat corect' });
    }

    // Obținem UUID-ul utilizatorului
    db.get('SELECT uuid FROM users WHERE id = ?', [req.user.id], async (err, user) => {
      if (err) {
        console.error('Eroare la obținerea UUID-ului utilizatorului:', err);
        return res.status(500).json({ message: 'Eroare la obținerea datelor utilizatorului' });
      }

      console.log('Date utilizator găsite:', user);

      if (!user || !user.uuid) {
        console.error('UUID-ul utilizatorului nu a fost găsit');
        return res.status(500).json({ message: 'UUID-ul utilizatorului nu a fost găsit' });
      }

      // Verificăm dacă există deja un document de acest tip pentru utilizator
      db.get('SELECT * FROM documents WHERE user_id = ? AND document_type = ?', 
        [req.user.id, documentType],
        async (err, existingDoc) => {
          if (err) {
            console.error('Eroare la verificarea documentului existent:', err);
            return res.status(500).json({ message: 'Eroare la verificarea documentului existent' });
          }

          const filePath = req.file.path;
          console.log('Fișier salvat la:', filePath);

          if (existingDoc) {
            // Actualizăm documentul existent
            db.run('UPDATE documents SET file_path = ?, user_uuid = ? WHERE user_id = ? AND document_type = ?',
              [filePath, user.uuid, req.user.id, documentType],
              function(err) {
                if (err) {
                  console.error('Eroare la actualizarea documentului:', err);
                  return res.status(500).json({ message: 'Eroare la actualizarea documentului' });
                }
                console.log('Document actualizat cu succes');
                res.json({ 
                  message: 'Document actualizat cu succes',
                  document: {
                    id: existingDoc.id,
                    documentType,
                    filePath
                  }
                });
              }
            );
          } else {
            // Inserăm un document nou
            db.run('INSERT INTO documents (user_id, user_uuid, document_type, file_path) VALUES (?, ?, ?, ?)',
              [req.user.id, user.uuid, documentType, filePath],
              function(err) {
                if (err) {
                  console.error('Eroare la inserarea documentului:', err);
                  return res.status(500).json({ message: 'Eroare la salvarea documentului' });
                }
                console.log('Document nou salvat cu succes, ID:', this.lastID);
                res.json({ 
                  message: 'Document salvat cu succes',
                  document: {
                    id: this.lastID,
                    documentType,
                    filePath
                  }
                });
              }
            );
          }
        }
      );
    });
  } catch (error) {
    console.error('Eroare la upload document:', error);
    res.status(500).json({ message: error.message });
  }
});

// Ruta pentru ștergerea documentelor
router.delete('/:type', authMiddleware, async (req, res) => {
  try {
    const { type } = req.params;
    const { message } = req.body; // Mesajul opțional pentru notificare

    // Verifică dacă utilizatorul este admin
    const user = await db.get('SELECT role FROM users WHERE uuid = ?', [req.user.uuid]);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Acces interzis' });
    }

    // Șterge documentul
    await db.run(
      'DELETE FROM documents WHERE document_type = ? AND user_uuid = ?',
      [type, req.user.uuid]
    );

    // Adaugă notificare pentru utilizator
    const notificationMessage = message || `Documentul de tip ${type} a fost șters de către administrator.`;
    await db.run(
      'INSERT INTO notifications (user_uuid, message, type) VALUES (?, ?, ?)',
      [req.user.uuid, notificationMessage, 'document_deleted']
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
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT uuid FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
          console.error('Eroare la obținerea UUID-ului utilizatorului:', err);
          reject(err);
        } else {
          resolve(user);
        }
      });
    });

    if (!user || !user.uuid) {
      console.error('UUID-ul utilizatorului nu a fost găsit');
      return res.status(500).json({ 
        success: false, 
        message: 'UUID-ul utilizatorului nu a fost găsit' 
      });
    }

    // Găsim documentul în baza de date
    const document = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM documents WHERE user_id = ? AND document_type = ?',
        [userId, documentType],
        (err, row) => {
          if (err) {
            console.error('Eroare la căutarea documentului:', err);
            reject(err);
          } else {
            console.log('Document găsit în baza de date:', row);
            resolve(row);
          }
        }
      );
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

// Ruta pentru obținerea tuturor documentelor (pentru administrator)
router.get('/', authMiddleware, (req, res) => {
  try {
    // Verificăm dacă utilizatorul este administrator
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acces interzis. Doar administratorii pot vedea toate documentele.' });
    }

    console.log('Preluare toate documentele pentru administrator');
    
    db.all(`
      SELECT d.*, u.uuid as user_uuid, u.name as user_name, u.email as user_email 
      FROM documents d 
      JOIN users u ON d.user_id = u.id
    `, [], (err, documents) => {
      if (err) {
        console.error('Eroare la preluarea documentelor:', err);
        return res.status(500).json({ message: 'Eroare la preluarea documentelor' });
      }

      console.log('Documente găsite:', documents.length);
      res.json(documents);
    });
  } catch (error) {
    console.error('Eroare la preluarea documentelor:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;