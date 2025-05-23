const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const universityRoutes = require('./routes/universityRoutes');
const programRoutes = require('./routes/programRoutes');
const savedProgramRoutes = require('./routes/savedProgramRoutes');
const documentRoutes = require('./routes/documents');
const applicationRoutes = require('./routes/applications');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rute API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/saved-programs', savedProgramRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);

// Servire fișiere statice pentru frontend
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Ruta pentru toate celelalte cereri
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Gestionare erori
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'A apărut o eroare pe server',
    error: err.message 
  });
});

module.exports = app; 