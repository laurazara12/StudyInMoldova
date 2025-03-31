// /backend/src/App.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('./middleware/auth');
const { sequelize } = require('./models');
const universitiesRouter = require('./routes/universities');
const { seedUniversities } = require('./seeders/universitySeeder');
require('dotenv').config();

const app = express();

// Configurare CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware pentru logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Creăm directorul pentru încărcări dacă nu există
const uploadsDir = path.join(__dirname, '../../backend/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurare directorul pentru fișiere statice
app.use('/uploads', express.static(path.join(__dirname, '../../backend/uploads')));

// Importăm rutele
const authRoutes = require('./routes/auth');
const documentsRoutes = require('./routes/documents');

// Folosim rutele
app.use('/api/auth', authRoutes);
app.use('/api/documents', authMiddleware, documentsRoutes);
app.use('/api/universities', universitiesRouter);

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

// Sincronizare baza de date și pornire server
const startServer = async () => {
  try {
    await sequelize.sync();
    console.log('Baza de date a fost sincronizată cu succes');
    
    await seedUniversities();
    
    const port = process.env.PORT || 4000;
    app.listen(port, () => {
      console.log(`Serverul rulează pe portul ${port}`);
    });
  } catch (error) {
    console.error('Eroare la pornirea serverului:', error);
  }
};

startServer();

module.exports = app;