require('dotenv').config();

// Verificăm configurația
if (!process.env.JWT_SECRET) {
  console.warn('AVERTISMENT: JWT_SECRET nu este configurat în fișierul .env. Se va folosi o cheie temporară.');
  process.env.JWT_SECRET = 'temporary_secret_key_for_development';
}

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('./middleware/auth');
const { sequelize, safeSync } = require('./config/database');
const universitiesRouter = require('./routes/universities');
const programsRouter = require('./routes/programRoutes');
const authRouter = require('./routes/auth');
const documentsRouter = require('./routes/documents');
const notificationRoutes = require('./routes/notificationRoutes');
const savedProgramRoutes = require('./routes/savedProgramRoutes');
const applicationsRouter = require('./routes/applications');
const helpYouChooseRoutes = require('./routes/helpYouChooseRoutes');
const { setupRoutes } = require('./routes');

const app = express();
const PORT = process.env.PORT || 4000;

// Configurare CORS mai permisivă pentru dezvoltare
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware pentru logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware pentru parsare JSON
app.use(express.json());

// Middleware pentru parsare URL-encoded
app.use(express.urlencoded({ extended: true }));

// Creăm directorul pentru încărcări dacă nu există
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurare directorul pentru fișiere statice
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ruta pentru verificarea stării serverului
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Configurare rute API
setupRoutes(app);

// Ruta pentru servirea fișierelor statice
app.use(express.static(path.join(__dirname, 'public')));

// Ruta pentru servirea aplicației React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware pentru gestionarea erorilor
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'A apărut o eroare pe server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Funcție pentru crearea unui utilizator admin
async function createAdminUser() {
  try {
    const { User } = require('./models');
    
    // Verificăm dacă există deja un utilizator admin
    const adminExists = await User.findOne({ where: { email: 'admin@example.com' } });
    
    if (!adminExists) {
      console.log('Creating admin user...');
      
      await User.create({
        name: 'Administrator',
        email: 'admin@example.com',
        password: '123',
        role: 'admin',
        status: 'active'
      });
      
      console.log('Admin user created successfully.');
    } else {
      // Verificăm dacă parola funcționează
      const isValid = await adminExists.validatePassword('123');
      if (!isValid) {
        console.log('Resetting admin password...');
        await adminExists.update({ password: '123' });
        console.log('Admin password reset successfully.');
      } else {
        console.log('Admin user exists with correct password.');
      }
    }
  } catch (error) {
    console.error('Error during admin user creation:', error);
  }
}

// Funcție pentru crearea unui utilizator de test
async function createTestUser() {
  try {
    const { User } = require('./models');
    const testUser = await User.findOne({ where: { email: 'user@example.com' } });
    
    if (!testUser) {
      console.log('Creating test user...');
      await User.create({
        email: 'user@example.com',
        password: '123',
        name: 'Test User',
        role: 'student',
        status: 'active'
      });
      console.log('Test user created successfully.');
    } else {
      // Verificăm dacă parola funcționează
      const isValid = await testUser.validatePassword('123');
      if (!isValid) {
        console.log('Resetting test user password...');
        await testUser.update({ password: '123' });
        console.log('Test user password reset successfully.');
      } else {
        console.log('Test user exists with correct password.');
      }
    }
  } catch (error) {
    console.error('Error during test user creation:', error);
  }
}

// Verificăm dacă există un argument pentru forțarea recreării tabelelor
const forceSync = process.argv.includes('--force-sync');

// Funcție pentru inițializarea bazei de date și crearea utilizatorului admin
async function initializeDatabase() {
  try {
    // Sincronizăm modelele
    if (forceSync) {
      console.log('Forcing table recreation...');
      await safeSync(true);
      console.log('Forced synchronization completed.');
    } else {
      await safeSync();
      console.log('Normal synchronization completed.');
    }

    // Creăm utilizatorul admin după ce tabelele sunt create
    await createAdminUser();
    // Creăm utilizatorul de test după ce tabelele sunt create
    await createTestUser();
  } catch (error) {
    console.error('Error during database initialization:', error);
    throw error;
  }
}

// Inițializare bază de date și pornire server
const startServer = async () => {
  try {
    await initializeDatabase();
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    });

    // Gestionare închidere sigură
    const gracefulShutdown = async (signal) => {
      console.log(`Received signal: ${signal}. Shutting down server...`);
      
      server.close(() => {
        console.log('HTTP server closed.');
        
        // Închidem conexiunea la baza de date
        sequelize.close().then(() => {
          console.log('Database connection closed.');
          process.exit(0);
        }).catch(err => {
          console.error('Error closing database connection:', err);
          process.exit(1);
        });
      });
      
      // Setăm un timeout pentru a forța închiderea dacă durează prea mult
      setTimeout(() => {
        console.error('Server did not close in time. Forcing shutdown.');
        process.exit(1);
      }, 10000);
    };

    // Ascultăm semnalele de închidere
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Gestionare erori neașteptate
process.on('uncaughtException', (err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled promise rejection:', reason);
});

// Gestionare erori de memorie
process.on('exit', (code) => {
  console.log(`Process is exiting with code: ${code}`);
});

// Gestionare erori de memorie
if (process.memoryUsage().heapUsed > 1024 * 1024 * 1024) { // 1GB
  console.warn('High memory usage detected. It is recommended to restart the server.');
}

startServer();

module.exports = app; 