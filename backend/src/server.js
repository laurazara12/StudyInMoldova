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
const http = require('http');
const multer = require('multer');
const { auth } = require('./middleware/auth');
const { sequelize, safeSync } = require('./config/database');
const universitiesRouter = require('./routes/universities');
const programsRouter = require('./routes/programRoutes');
const authRouter = require('./routes/auth');
const documentsRouter = require('./routes/documents');
const notificationRoutes = require('./routes/notificationRoutes');
const savedProgramRoutes = require('./routes/savedProgramRoutes');
const applicationsRouter = require('./routes/applications');
const helpYouChooseRoutes = require('./routes/helpYouChooseRoutes');
const paymentRoutes = require('./routes/payment.routes');
const { setupRoutes } = require('./routes');
const { wss, authenticateWebSocket } = require('./websocket/notificationSocket');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const userRoutes = require('./routes/userRoutes');

const app = express();
const server = http.createServer(app);
const PORT = 4000; // Forțăm portul 4000

// Configurare multer pentru multipart/form-data
const upload = multer();

// Configurare middleware-uri de bază
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware pentru setarea header-urilor JSON pentru toate rutele API
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Accept', 'application/json');
  }
  next();
});

// Creăm directorul pentru încărcări dacă nu există
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurare rute API în ordinea corectă
app.use('/api/users', userRoutes);
app.use('/api/auth', authRouter);
app.use('/api/notifications', notificationRoutes);
app.use('/api/universities', universitiesRouter);
app.use('/api/programs', programsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/saved-programs', savedProgramRoutes);
app.use('/api/applications', upload.none(), applicationsRouter);
app.use('/api/help-you-choose', helpYouChooseRoutes);
app.use('/api/payments', paymentRoutes);

// Ruta pentru verificarea stării serverului
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Ruta pentru verificarea token-ului
app.get('/api/auth/verify-token', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Token valid',
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Ruta pentru obținerea datelor utilizatorului curent
app.get('/api/auth/me', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Date utilizator preluate cu succes',
    data: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role
    }
  });
});

// Ruta pentru servirea fișierelor statice
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ruta pentru servirea aplicației React (doar pentru rutele non-API)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// Ruta pentru pagina de start (doar pentru rutele non-API)
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ro">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Study in Moldova API</title>
    </head>
    <body>
        <h1>Study in Moldova API</h1>
        <p>Bine ați venit la API-ul Study in Moldova!</p>
    </body>
    </html>
  `);
});

// Handler pentru rutele neexistente
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({
      success: false,
      message: 'Endpoint-ul nu a fost găsit'
    });
  } else {
    res.status(404).send('Pagina nu a fost găsită');
  }
});

// Gestionare upgrade WebSocket
server.on('upgrade', async (request, socket, head) => {
  try {
    // Extrage token-ul din header-ul de autorizare
    const token = request.headers['sec-websocket-protocol']?.split(',')[0]?.trim();
    
    if (!token) {
      console.error('Token lipsă pentru WebSocket');
      socket.destroy();
      return;
    }

    // Autentifică utilizatorul
    const user = await authenticateWebSocket(token);
    if (!user) {
      console.error('Autentificare eșuată pentru WebSocket');
      socket.destroy();
      return;
    }

    // Adaugă utilizatorul la request pentru a fi disponibil în handler-ul de conexiune
    request.user = user;

    // Upgrade la WebSocket
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } catch (error) {
    console.error('Eroare la upgrade-ul WebSocket:', error);
    socket.destroy();
  }
});

// Gestionare erori globale
app.use((err, req, res, next) => {
  console.error('Eroare server:', err);
  res.status(500).json({
    error: 'Eroare internă server',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
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

// Gestionare conexiuni WebSocket
wss.on('connection', (ws, request) => {
  if (!request.user) {
    console.error('Utilizator lipsă în request');
    ws.close(1008, 'Utilizator neautentificat');
    return;
  }

  const userId = request.user.id;
  console.log('Nouă conexiune WebSocket stabilită pentru utilizatorul:', userId);
  
  ws.on('error', (error) => {
    console.error('Eroare WebSocket:', error);
  });

  ws.on('close', () => {
    console.log('Conexiune WebSocket închisă pentru utilizatorul:', userId);
  });

  // Trimite un mesaj de confirmare la conectare
  ws.send(JSON.stringify({
    type: 'connection_established',
    message: 'Conexiune WebSocket stabilită cu succes'
  }));
});

// Pornim serverul
const startServer = async () => {
  try {
    await initializeDatabase();
    console.log('Conexiunea la baza de date a fost stabilită cu succes.');
    
    server.listen(PORT, () => {
      console.log(`Server rulează pe portul ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
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