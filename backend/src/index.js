const express = require('express');
const cors = require('cors');
const { safeSync } = require('./config/database');
const authRoutes = require('./routes/auth');
const documentsRoutes = require('./routes/documents');
const universitiesRoutes = require('./routes/universities');

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/universities', universitiesRoutes);

// Inițializăm baza de date și pornim serverul
async function startServer() {
  try {
    // Inițializăm baza de date doar dacă nu există
    await safeSync();
    
    app.listen(port, () => {
      console.log(`Serverul rulează pe portul ${port}`);
    });
  } catch (error) {
    console.error('Eroare la pornirea serverului:', error);
    process.exit(1);
  }
}

startServer(); 