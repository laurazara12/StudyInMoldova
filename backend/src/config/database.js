// /backend/src/config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

// Configurare directoare
const DB_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DB_DIR, 'database.sqlite');
const BACKUP_DIR = path.join(DB_DIR, 'backups');

// Creare directoare necesare
[DB_DIR, BACKUP_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Funcție pentru backup
const createBackup = () => {
  if (fs.existsSync(DB_FILE)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.sqlite`);
    fs.copyFileSync(DB_FILE, backupFile);
    console.log(`Backup creat: ${backupFile}`);
  }
};

// Verificare dacă baza de date există
const dbExists = fs.existsSync(DB_FILE);

// Configurare Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: DB_FILE,
  logging: false
});

// Import models
const UserModel = require('../models/user');
const UniversityModel = require('../models/university');
const DocumentModel = require('../models/document');
const ProgramModel = require('../models/program');

// Initialize models
const User = UserModel(sequelize);
const University = UniversityModel(sequelize);
const Document = DocumentModel(sequelize);
const Program = ProgramModel(sequelize);

// Define relationships
Program.belongsTo(University, { foreignKey: 'universityId' });
University.hasMany(Program, { foreignKey: 'universityId' });

// Funcție pentru sincronizare sigură
const safeSync = async () => {
  try {
    // Verificăm dacă baza de date există și este accesibilă
    if (dbExists) {
      try {
        // Testăm conexiunea
        await sequelize.authenticate();
        console.log('Conexiune la baza de date verificată.');
      } catch (error) {
        console.error('Eroare la conectarea la baza de date:', error);
        return;
      }
    }

    // Sincronizăm doar dacă este necesar
    await sequelize.sync({ 
      alter: true,
      force: false,
      validate: true
    });

    console.log('Baza de date sincronizată cu succes');
  } catch (error) {
    console.error('Eroare la sincronizarea bazei de date:', error);
  }
};

// Executăm sincronizarea inițială
safeSync();

// Exportăm funcțiile și modelele
module.exports = {
  sequelize,
  User,
  University,
  Document,
  Program,
  createBackup,
  safeSync
};