const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('./middleware/auth');
const { sequelize, safeSync } = require('./config/database');
const universitiesRouter = require('./routes/universities');
const programsRouter = require('./routes/programs');
const authRouter = require('./routes/auth');
const documentsRouter = require('./routes/documents');
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
const uploadsDir = path.join(__dirname, '../../backend/backend/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurare directorul pentru fișiere statice
app.use('/uploads', express.static(path.join(__dirname, '../../backend/backend/uploads')));

// Rute API
app.use('/api/programs', programsRouter);
app.use('/api/auth', authRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/universities', universitiesRouter);

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

// Verificăm dacă există un argument pentru forțarea recreării tabelelor
const forceSync = process.argv.includes('--force-sync');

// Sincronizăm baza de date
if (forceSync) {
  console.log('Se forțează recrearea tabelelor...');
  safeSync(true).then(() => {
    console.log('Sincronizarea forțată a fost finalizată.');
    createAdminUser();
  }).catch(err => {
    console.error('Eroare la sincronizarea forțată:', err);
  });
} else {
  safeSync().then(() => {
    console.log('Sincronizarea normală a fost finalizată.');
    createAdminUser();
  }).catch(err => {
    console.error('Eroare la sincronizarea normală:', err);
  });
}

// Funcție pentru crearea unui utilizator admin
async function createAdminUser() {
  try {
    const { User } = require('./models');
    const bcrypt = require('bcryptjs');
    
    // Verificăm dacă există deja un utilizator admin
    const adminExists = await User.findOne({ where: { email: 'admin@example.com' } });
    
    if (!adminExists) {
      console.log('Se creează utilizatorul admin...');
      const hashedPassword = await bcrypt.hash('123', 10);
      
      await User.create({
        name: 'Administrator',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      });
      
      console.log('Utilizatorul admin a fost creat cu succes.');
    } else {
      console.log('Utilizatorul admin există deja.');
    }
  } catch (error) {
    console.error('Eroare la crearea utilizatorului admin:', error);
  }
}

// Middleware pentru gestionarea erorilor
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'A apărut o eroare pe server', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Pornim serverul
const server = app.listen(PORT, () => {
  console.log(`Serverul rulează pe portul ${PORT}`);
});

// Gestionare închidere sigură
const gracefulShutdown = async (signal) => {
  console.log(`Semnal primit: ${signal}. Se închide serverul...`);
  
  // Închidem serverul HTTP
  server.close(() => {
    console.log('Serverul HTTP a fost închis.');
    
    // Închidem conexiunea la baza de date
    sequelize.close().then(() => {
      console.log('Conexiunea la baza de date a fost închisă.');
      process.exit(0);
    }).catch(err => {
      console.error('Eroare la închiderea conexiunii la baza de date:', err);
      process.exit(1);
    });
  });
  
  // Setăm un timeout pentru a forța închiderea dacă durează prea mult
  setTimeout(() => {
    console.error('Serverul nu s-a închis în timp util. Se forțează închiderea.');
    process.exit(1);
  }, 10000);
};

// Ascultăm semnalele de închidere
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Gestionare erori neașteptate
process.on('uncaughtException', (err) => {
  console.error('Eroare neașteptată:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promisiune nerezolvată:', reason);
  // Nu închidem serverul aici, doar logăm eroarea
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