const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const seedUniversities = require('./config/seedUniversities');

const app = express();

// Configure CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
const universitiesRouter = require('./routes/universities');
app.use('/api/universities', universitiesRouter);

// Sync database and seed data
const startServer = async () => {
  try {
    await sequelize.sync();
    console.log('Database synced successfully');
    
    // Seed universities data
    await seedUniversities();
    
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Serverul rulează pe portul ${port}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
};

startServer(); 