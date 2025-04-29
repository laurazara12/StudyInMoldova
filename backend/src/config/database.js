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

// Funcție pentru verificarea existenței tabelelor
const checkTablesExist = async () => {
  try {
    // Verificăm dacă tabela users există
    const result = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='users'",
      { type: sequelize.QueryTypes.SELECT }
    );
    return result.length > 0;
  } catch (error) {
    console.error('Eroare la verificarea tabelelor:', error);
    return false;
  }
};

// Funcție pentru sincronizare sigură
const safeSync = async (force = false) => {
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

    // Verificăm dacă tabelele există
    const tablesExist = await checkTablesExist();
    
    if (tablesExist) {
      console.log('Tabelele există în baza de date.');
    } else {
      console.log('Tabelele nu există în baza de date.');
    }

    // Sincronizăm cu opțiunile corespunzătoare
    if (force || !dbExists || !tablesExist) {
      console.log('Se creează tabelele în baza de date...');
      await sequelize.sync({ force: false });
      console.log('Tabelele au fost create cu succes.');
    } else {
      console.log('Se actualizează schema bazei de date...');
      await sequelize.sync({ alter: true });
      console.log('Schema bazei de date a fost actualizată cu succes.');
    }

    console.log('Baza de date sincronizată cu succes');
  } catch (error) {
    console.error('Eroare la sincronizarea bazei de date:', error);
  }
};

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