const express = require('express');
const cors = require('cors');
const { safeSync } = require('./config/database');
const authRoutes = require('./routes/auth');
const documentsRoutes = require('./routes/documents');
const universitiesRoutes = require('./routes/universities');
const programsRoutes = require('./routes/programs');
const applicationsRoutes = require('./routes/applications');

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/universities', universitiesRoutes);
app.use('/api/programs', programsRoutes);
app.use('/api/applications', applicationsRoutes);

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database only if it doesn't exist
    await safeSync();
    
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer(); 