// /backend/src/App.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
require('dotenv').config();
const path = require('path');

const app = express();

app.use(express.json());
// Configurare CORS pentru a permite cereri de la localhost:3000
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));


// Rute
app.use('/api/auth', authRoutes);

app.use(express.static(path.join(__dirname, 'frontend', 'build')));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

// Gestionare erori
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something is wrong !');
});

module.exports = app;