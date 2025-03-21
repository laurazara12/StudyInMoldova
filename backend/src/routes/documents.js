const express = require('express');
const multer = require('multer');
const fs = require('fs');
const db = require('../config/database');
const path = require('path');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Configurare multer pentru încărcarea fișierelor
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Creăm un director pentru utilizator
    const userId = req.user?.id || 'unknown';
    const userDir = path.join(__dirname, '../../uploads', userId.toString());
    
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
  },
  filename: function (req, file, cb) {
    try {
      const documentType = req.body.documentType || 'unknown';
      const userData = req.user || {};
      const userName = userData.name || 'unknown';
      
      // Creăm numele fișierului în formatul: tip_numeuser.extensie
      const fileExtension = path.extname(file.originalname);
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
    console.log('Încercare de upload document:', {
      userId: req.user.id,
      documentType: req.body.documentType,
      hasFile: !!req.file
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
          db.run('UPDATE documents SET file_path = ? WHERE user_id = ? AND document_type = ?',
            [filePath, req.user.id, documentType],
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
          db.run('INSERT INTO documents (user_id, document_type, file_path) VALUES (?, ?, ?)',
            [req.user.id, documentType, filePath],
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
  } catch (error) {
    console.error('Eroare la upload document:', error);
    res.status(500).json({ message: error.message });
  }
});

// Ruta pentru ștergerea documentelor
router.delete('/:documentType', authMiddleware, (req, res) => {
  try {
    const { documentType } = req.params;
    const userId = req.user ? req.user.id : null;

    if (!userId) {
      console.error('userId nu este disponibil în req.user');
      return res.status(401).json({ success: false, message: 'Utilizator neautentificat.' });
    }

    console.log(`Cerere de ștergere primită pentru documentType: ${documentType}, userId: ${userId}`);

    db.get(
      'SELECT file_path FROM documents WHERE user_id = ? AND document_type = ?',
      [userId, documentType],
      (err, row) => {
        if (err) {
          console.error('Eroare la căutarea documentului:', err);
          return res.status(500).json({ success: false });
        }
        if (!row) {
          console.log('Documentul nu a fost găsit în baza de date.');
          return res.status(404).json({ success: false, message: 'Documentul nu a fost găsit.' });
        }

        const filePath = row.file_path;
        console.log(`Calea fișierului pentru ștergere: ${filePath}`);

        fs.access(filePath, fs.constants.F_OK | fs.constants.W_OK, (err) => {
          if (err) {
            console.error('Fișierul nu poate fi accesat sau șters:', err);
            return res.status(500).json({ success: false, message: 'Fișierul nu poate fi accesat sau șters.' });
          }

          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Eroare la ștergerea fișierului:', err);
              return res.status(500).json({ success: false });
            }

            db.run(
              'DELETE FROM documents WHERE user_id = ? AND document_type = ?',
              [userId, documentType],
              (err) => {
                if (err) {
                  console.error('Eroare la ștergerea documentului din baza de date:', err);
                  return res.status(500).json({ success: false });
                }
                console.log('Document șters cu succes.');
                res.json({ success: true });
              }
            );
          });
        });
      }
    );
  } catch (error) {
    console.error('Eroare neașteptată:', error);
    res.status(500).json({ success: false, message: 'Eroare internă server.' });
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

    // Verificăm dacă tabelul documents există
    const tableExists = await new Promise((resolve, reject) => {
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='documents'", (err, row) => {
        if (err) {
          console.error('Eroare la verificarea tabelului documents:', err);
          reject(err);
        } else {
          resolve(!!row);
        }
      });
    });

    if (!tableExists) {
      console.error('Tabelul documents nu există');
      return res.status(500).json({ 
        success: false, 
        message: 'Tabelul documents nu există' 
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
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${path.basename(document.file_path)}`);

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