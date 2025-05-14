require('dotenv').config();

// Verificăm configurația
if (!process.env.JWT_SECRET) {
  console.error('EROARE: JWT_SECRET nu este configurat în fișierul .env');
  process.exit(1);
}

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
const notificationRoutes = require('./routes/notificationRoutes');
const savedProgramRoutes = require('./routes/savedProgramRoutes');
const applicationsRouter = require('./routes/applications');

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
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurare directorul pentru fișiere statice
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rute API
app.use('/api/programs', programsRouter);
app.use('/api/saved-programs', savedProgramRoutes);
app.use('/api/auth', authRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/universities', universitiesRouter);
app.use('/api/notifications', notificationRoutes);
app.use('/api/applications', applicationsRouter);

// Ruta pentru verificarea stării serverului
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Middleware pentru gestionarea erorilor API
app.use('/api', (err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ 
    success: false,
    message: 'An error occurred on the server', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Servim fișierele statice din frontend/build
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// Ruta pentru orice altă cerere
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../../frontend/build', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error('Frontend build not found at:', indexPath);
    res.status(404).json({ 
      message: 'Frontend build not found. Please run npm run build in the frontend directory.',
      path: indexPath
    });
  }
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
  }
}

// Inițializăm baza de date
initializeDatabase();

// Middleware pentru gestionarea erorilor
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'An error occurred on the server', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Log registered routes
console.log('Rute înregistrate:');
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    middleware.handle.stack.forEach((handler) => {
      if (handler.route) {
        console.log(`${Object.keys(handler.route.methods).join(', ').toUpperCase()} ${handler.route.path}`);
      }
    });
  }
});

// Pornim serverul
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Gestionare închidere sigură
const gracefulShutdown = async (signal) => {
  console.log(`Received signal: ${signal}. Shutting down server...`);
  
  // Închidem serverul HTTP
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

// Gestionare erori neașteptate
process.on('uncaughtException', (err) => {
  console.error('Unexpected error:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled promise rejection:', reason);
  // Nu închidem serverul aici, doar logăm eroarea
});

// Gestionare erori de memorie
process.on('exit', (code) => {
  console.log(`Process is exiting with code: ${code}`);
});

// Gestionare erori de memorie
if (process.memoryUsage().heapUsed > 1024 * 1024 * 1024) { // 1GB
  console.warn('High memory usage detected. It is recommended to restart the server.');
}

module.exports = app; 