// /backend/src/config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const config = require('./config.json')[process.env.NODE_ENV || 'development'];

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
  ...config,
  dialect: 'sqlite',
  storage: config.storage,
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true
  }
});

// Import models
const UserModel = require('../models/user');
const UniversityModel = require('../models/university');
const DocumentModel = require('../models/document');
const ProgramModel = require('../models/program');
const NotificationModel = require('../models/notification');
const ApplicationModel = require('../models/application');
const SavedProgramModel = require('../models/savedProgram');

// Initialize models
const User = UserModel(sequelize);
const University = UniversityModel(sequelize);
const Document = DocumentModel(sequelize);
const Program = ProgramModel(sequelize);
const Notification = NotificationModel(sequelize);
const Application = ApplicationModel(sequelize);
const SavedProgram = SavedProgramModel(sequelize);

// Define relationships
Program.belongsTo(University, { 
  foreignKey: 'universityId', 
  as: 'University',
  onDelete: 'CASCADE'
});
University.hasMany(Program, { 
  foreignKey: 'universityId',
  onDelete: 'CASCADE'
});

Application.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user',
  onDelete: 'CASCADE'
});
Application.belongsTo(Program, { 
  foreignKey: 'program_id', 
  as: 'program',
  onDelete: 'CASCADE'
});
User.hasMany(Application, { 
  foreignKey: 'user_id',
  onDelete: 'CASCADE'
});
Program.hasMany(Application, { 
  foreignKey: 'program_id',
  onDelete: 'CASCADE'
});

SavedProgram.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'User',
  onDelete: 'CASCADE'
});
SavedProgram.belongsTo(Program, { 
  foreignKey: 'programId', 
  as: 'Program',
  onDelete: 'CASCADE'
});
User.hasMany(SavedProgram, { 
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});
Program.hasMany(SavedProgram, { 
  foreignKey: 'programId',
  onDelete: 'CASCADE'
});

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
async function safeSync() {
  try {
    console.log('Se creează tabelele în baza de date...');
    
    // Verificăm dacă tabelele există deja
    const tablesExist = await checkTablesExist();
    
    if (!tablesExist) {
      // Ștergem toate tabelele în ordinea corectă
      await SavedProgram.drop();
      await Application.drop();
      await Document.drop();
      await Program.drop();
      await University.drop();
      await Notification.drop();
      await User.drop();
      
      // Creăm tabelele în ordinea corectă
      await User.sync();
      await University.sync();
      await Document.sync();
      await Program.sync();
      await Notification.sync();
      await Application.sync();
      await SavedProgram.sync();
      
      console.log('Tabelele au fost actualizate cu succes');

      // Verificăm dacă există utilizatorul admin
      const adminExists = await User.findOne({ where: { email: 'admin@example.com' } });
      if (!adminExists) {
        await User.create({
          name: 'Admin User',
          email: 'admin@example.com',
          password: '123',
          role: 'admin',
          status: 'active'
        });
        console.log('Utilizatorul admin a fost creat');
      }

      // Verificăm dacă există utilizatorul de test
      const testUserExists = await User.findOne({ where: { email: 'user@example.com' } });
      if (!testUserExists) {
        await User.create({
          name: 'Test User',
          email: 'user@example.com',
          password: '123',
          role: 'student',
          status: 'active'
        });
        console.log('Utilizatorul de test a fost creat');
      }
    } else {
      console.log('Tabelele există deja, nu este nevoie să fie recreate.');
    }

    console.log('Baza de date a fost sincronizată cu succes');
  } catch (error) {
    console.error('Eroare la sincronizarea bazei de date:', error);
    throw error;
  }
}

// Exportăm funcțiile și modelele
module.exports = {
  sequelize,
  User,
  University,
  Document,
  Program,
  Notification,
  Application,
  SavedProgram,
  createBackup,
  safeSync
};