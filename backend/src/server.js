const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('./middleware/auth');
const { sequelize } = require('./config/database');
const universitiesRouter = require('./routes/universities');
const programsRouter = require('./routes/programs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware pentru logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

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
app.use('/api/programs', programsRouter);

// Ruta pentru verificarea stării serverului
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Servim fișierele statice din frontend/build
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// Ruta pentru orice altă cerere
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
});

// Sincronizare baza de date
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synchronized');
}).catch(err => {
  console.error('Error synchronizing database:', err);
});

// Gestionare erori
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'A apărut o eroare internă',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Funcție pentru închiderea sigură a serverului
const gracefulShutdown = (signal) => {
  console.log(`\nPrimit semnal ${signal}. Închidere server în mod sigur...`);
  
  // Setăm un timeout pentru închidere forțată dacă procesul durează prea mult
  const forceShutdown = setTimeout(() => {
    console.error('Serverul nu s-a închis în timp util. Închidere forțată.');
    process.exit(1);
  }, 10000); // 10 secunde timeout
  
  // Închidem serverul HTTP
  server.close(() => {
    console.log('Server HTTP închis.');
    
    // Închidem conexiunea la baza de date
    sequelize.close()
      .then(() => {
        console.log('Conexiune la baza de date închisă.');
        clearTimeout(forceShutdown);
        process.exit(0);
      })
      .catch(err => {
        console.error('Eroare la închiderea conexiunii la baza de date:', err);
        clearTimeout(forceShutdown);
        process.exit(1);
      });
  });
};

// Pornire server
const server = app.listen(PORT, () => {
  console.log(`Serverul rulează pe portul ${PORT}`);
});

// Gestionare semnale de oprire
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Gestionare erori neașteptate
process.on('uncaughtException', (err) => {
  console.error('Eroare neașteptată:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promisiune nerezolvată:', reason);
  gracefulShutdown('unhandledRejection');
});

// Gestionare erori de memorie
process.on('exit', (code) => {
  console.log(`Procesul se închide cu codul: ${code}`);
});

// Gestionare erori de memorie
if (process.memoryUsage().heapUsed > 1024 * 1024 * 1024) { // 1GB
  console.warn('Utilizare mare de memorie detectată. Se recomandă restartul serverului.');
}

module.exports = app; 