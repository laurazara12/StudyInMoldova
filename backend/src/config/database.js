// /backend/src/config/database.js
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');

// Creăm directorul pentru baza de date dacă nu există
const dbDirectory = path.dirname(path.join(__dirname, 'database.sqlite'));
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}

// Funcție pentru generarea unui UUID scurt (6 caractere)
function generateShortUUID() {
  return Math.random().toString(36).substring(2, 8);
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

const db = sequelize.define('users', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  uuid: {
    type: Sequelize.TEXT,
    unique: true,
    allowNull: false
  },
  email: {
    type: Sequelize.TEXT,
    unique: true,
    allowNull: false
  },
  password: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  name: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  role: {
    type: Sequelize.TEXT,
    allowNull: false,
    defaultValue: 'user'
  },
  created_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
  tableName: 'users',
  timestamps: false
});

const documents = sequelize.define('documents', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  user_uuid: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  document_type: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  file_path: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  created_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
  tableName: 'documents',
  timestamps: false,
  uniqueKeys: {
    documents_unique: {
      fields: ['user_uuid', 'document_type']
    }
  }
});

async function createAdminUser() {
  try {
    const adminEmail = 'admin@example.com';
    const adminPassword = await bcrypt.hash('admin07', 10);
    const testUserEmail = 'user3@example.com';
    const testUserPassword = await bcrypt.hash('123', 10);

    console.log('Începem crearea utilizatorilor...');

    // Creăm admin-ul
    const adminExists = await db.findOne({ where: { email: adminEmail } });

    if (!adminExists) {
      await db.create({
        uuid: generateShortUUID(),
        email: adminEmail,
        password: adminPassword,
        name: 'Administrator',
        role: 'admin'
      });
    } else {
      console.log('Utilizator admin existent, ID:', adminExists.id);
    }

    // Creăm utilizatorul de test
    const testUserExists = await db.findOne({ where: { email: testUserEmail } });

    if (!testUserExists) {
      await db.create({
        uuid: generateShortUUID(),
        email: testUserEmail,
        password: testUserPassword,
        name: 'Test User',
        role: 'user'
      });
    } else {
      console.log('Utilizator de test existent, ID:', testUserExists.id);
    }
  } catch (error) {
    console.error('Eroare la crearea utilizatorilor:', error);
  }
}

sequelize.sync({ force: false })
  .then(() => {
    console.log('Baza de date sincronizată cu succes');
    createAdminUser();
  })
  .catch((error) => {
    console.error('Eroare la sincronizarea bazei de date:', error);
  });

module.exports = sequelize;