// /backend/src/config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

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
const NotificationModel = require('../models/notification');

// Initialize models
const User = UserModel(sequelize);
const University = UniversityModel(sequelize);
const Document = DocumentModel(sequelize);
const Program = ProgramModel(sequelize);
const Notification = NotificationModel(sequelize);

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
      // Doar actualizăm schema dacă este necesar
      await sequelize.sync({ alter: true });
      console.log('Schema bazei de date a fost actualizată cu succes.');
    } else {
      console.log('Se creează tabelele în baza de date...');
      await sequelize.sync();
      console.log('Tabelele au fost create cu succes.');
      
      // Creăm utilizatorul admin implicit doar dacă tabelele nu există
      try {
        const hashedPassword = await bcrypt.hash('123', 10);
        await User.create({
          name: 'Admin',
          email: 'admin@example.com',
          password: hashedPassword,
          role: 'admin'
        });
        console.log('Utilizator admin creat cu succes');
      } catch (error) {
        console.error('Eroare la crearea utilizatorului admin:', error);
      }
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
  Notification,
  createBackup,
  safeSync
};