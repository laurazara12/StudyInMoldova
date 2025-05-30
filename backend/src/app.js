const express = require('express');
const cors = require('cors');
const path = require('path');
const { setupRoutes } = require('./routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurare rute
setupRoutes(app);

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