const express = require('express');
const cors = require('cors');
const path = require('path');
const { setupRoutes } = require('./routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route configuration
setupRoutes(app);

// Serve static files for frontend
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Route for all other requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'An error occurred on the server',
    error: err.message 
  });
});

module.exports = app; 