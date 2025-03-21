// /backend/src/App.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('./middleware/auth');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Creăm directorul pentru încărcări dacă nu există
const uploadsDir = path.join(__dirname, '../../backend/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware pentru logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Configurare directorul pentru fișiere statice
app.use('/uploads', express.static(path.join(__dirname, '../../backend/uploads')));

// Importăm rutele
const authRoutes = require('./routes/auth');
const documentsRoutes = require('./routes/documents');

// Folosim rutele
app.use('/api/auth', authRoutes);
app.use('/api/documents', authMiddleware, documentsRoutes);

// Servire fișiere statice pentru frontend
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// Ruta principală
app.get('/', (req, res) => {
  res.send('API Study in Moldova');
});

// Rută pentru toate celelalte cereri (pentru React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
});

// Middleware pentru gestionarea erorilor
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Eroare internă server.' });
});

// Pornim serverul doar dacă fișierul este rulat direct
if (require.main === module) {
  const port = process.env.PORT || 4000;
  const http = require('http');
  const server = http.createServer(app);

  server.listen(port, (err) => {
    if (err) {
      console.error('Eroare la lansarea serverului:', err);
      process.exit(1);
    }
    console.log(`Serverul rulează pe portul ${port}`);
  });

  process.on('SIGINT', () => {
    console.log('Serverul a fost oprit manual');
    server.close(() => {
      console.log('Serverul s-a oprit corect');
      process.exit(0);
    });
  });
}

module.exports = app;