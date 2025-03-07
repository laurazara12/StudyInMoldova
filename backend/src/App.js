// /backend/src/App.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Rute
app.use('/api/auth', authRoutes);

// Gestionare erori
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Ceva nu a mers bine!');
});

module.exports = app;