const express = require('express');
const cors = require('cors');
const path = require('path');
const app = require('./src/App');

app.use(express.static(path.join(__dirname, 'frontend', 'build')));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

const port = process.env.PORT || 4000;
const http = require('http');
const server = http.createServer(app);

// Ascultă pe portul specificat
server.listen(port, (err) => {
  if (err) {
    console.error('Eroare la lansarea serverului:', err);
    process.exit(1); // Ieși din aplicație dacă apare o eroare
  }
  console.log(`Serverul rulează pe portul ${port}`);
});

process.on('SIGINT', () => {
  console.log('Serverul a fost oprit manual');
  server.close(() => {
    console.log('Serverul s-a oprit corect');
    process.exit(0);
  });
});
