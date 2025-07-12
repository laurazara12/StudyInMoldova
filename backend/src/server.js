require('dotenv').config();

// Check configuration
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not configured in .env file. A temporary key will be used.');
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
const { setupRoutes } = require('./routes');
const { wss, authenticateWebSocket } = require('./websocket/notificationSocket');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

// Configure multer for multipart/form-data
const upload = multer();

// Configure basic middleware
app.use(cors({
  origin: [
    'https://studyinmoldova-frontend.onrender.com',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for setting JSON headers for all API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Accept', 'application/json');
  }
  next();
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure API routes using setupRoutes
setupRoutes(app);

// Route for checking server status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Route for verifying token
app.get('/api/auth/verify-token', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Valid token',
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Route for getting current user data
app.get('/api/auth/me', auth, (req, res) => {
  res.json({
    success: true,
    message: 'User data retrieved successfully',
    data: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role
    }
  });
});

// Route for serving static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Route for serving React app (only for non-API routes)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// Route for home page (only for non-API routes)
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Study in Moldova API</title>
    </head>
    <body>
        <h1>Study in Moldova API</h1>
        <p>Welcome to the Study in Moldova API!</p>
    </body>
    </html>
  `);
});

// Handler for non-existent routes
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({
      success: false,
      message: 'Endpoint not found'
    });
  } else {
    res.status(404).send('Page not found');
  }
});

// Handle WebSocket upgrade
server.on('upgrade', async (request, socket, head) => {
  try {
    // Extract token from protocol
    const protocols = request.headers['sec-websocket-protocol'];
    const token = protocols ? protocols.split(',')[0].trim() : null;
    
    if (!token) {
      console.error('Missing token for WebSocket');
      socket.destroy();
      return;
    }

    // Authenticate user
    const user = await authenticateWebSocket(token);
    if (!user) {
      console.error('WebSocket authentication failed');
      socket.destroy();
      return;
    }

    // Add user to request to be available in connection handler
    request.user = user;

    // Upgrade to WebSocket
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } catch (error) {
    console.error('Error during WebSocket upgrade:', error);
    socket.destroy();
  }
});

// Global error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Function for creating an admin user
async function createAdminUser() {
  try {
    const { User } = require('./models');
    
    // Check if admin user already exists
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
      // Check if password works
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

// Function for creating a test user
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
      // Check if password works
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

// Check if there's an argument for forcing table recreation
const forceSync = process.argv.includes('--force-sync');

// Function for initializing database and creating admin user
async function initializeDatabase() {
  try {
    // Synchronize models
    if (forceSync) {
      console.log('Forcing table recreation...');
      await safeSync(true);
      console.log('Forced synchronization completed.');
    } else {
      await safeSync();
      console.log('Normal synchronization completed.');
    }

    // Create admin user after tables are created
    await createAdminUser();
    // Create test user after tables are created
    await createTestUser();
  } catch (error) {
    console.error('Error during database initialization:', error);
    throw error;
  }
}

// Handle WebSocket connections
wss.on('connection', (ws, request) => {
  if (!request.user) {
    console.error('Missing user in request');
    ws.close(1008, 'Unauthenticated user');
    return;
  }

  const userId = request.user.id;
  console.log('New WebSocket connection established for user:', userId);
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed for user:', userId);
  });

  // Send confirmation message on connection
  ws.send(JSON.stringify({
    type: 'connection_established',
    message: 'WebSocket connection successfully established'
  }));
});

// Start server
const startServer = async () => {
  try {
    await initializeDatabase();
    console.log('Database connection established successfully.');
    
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('CORS enabled for:', process.env.FRONTEND_URL || [
        'https://studyinmoldova-frontend.onrender.com',
        'http://localhost:3000'
      ]);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

// Handle unexpected errors
process.on('uncaughtException', (err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled promise rejection:', reason);
});

// Handle memory errors
process.on('exit', (code) => {
  console.log(`Process is exiting with code: ${code}`);
});

// Handle memory errors
if (process.memoryUsage().heapUsed > 1024 * 1024 * 1024) { // 1GB
  console.warn('High memory usage detected. It is recommended to restart the server.');
}

startServer();

module.exports = app; 