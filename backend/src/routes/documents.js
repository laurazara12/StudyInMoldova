const express = require('express');
const multer = require('multer');
const db = require('../config/database');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Specifică directorul unde vor fi stocate fișierele

router.post('/upload', upload.single('file'), (req, res) => {
  const { documentType } = req.body;
  const userId = req.user.id; // Presupunem că userId este disponibil în req.user
  const filePath = req.file.path;

  db.run(
    'INSERT INTO documents (user_id, document_type, file_path) VALUES (?, ?, ?)',
    [userId, documentType, filePath],
    (err) => {
      if (err) {
        console.error('Eroare la salvarea documentului:', err);
        return res.status(500).json({ success: false });
      }
      res.json({ success: true });
    }
  );
});

module.exports = router;