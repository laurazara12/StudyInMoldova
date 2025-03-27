// /backend/src/config/database.js
const sqlite3 = require('sqlite3').verbose();
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

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
  if (err) {
    console.error('Eroare la deschiderea bazei de date:', err);
    return;
  }
  console.log('Baza de date a fost deschisă cu succes');

  // Creăm tabelul users dacă nu există
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Eroare la crearea tabelului users:', err);
    } else {
      console.log('Tabelul users a fost creat sau există deja');
      // Adăugăm UUID-uri pentru utilizatorii care nu au
      db.all('SELECT id FROM users WHERE uuid IS NULL', [], (err, users) => {
        if (err) {
          console.error('Eroare la verificarea UUID-urilor:', err);
          return;
        }

        users.forEach(user => {
          const shortUUID = generateShortUUID();
          db.run('UPDATE users SET uuid = ? WHERE id = ?', [shortUUID, user.id], (err) => {
            if (err) {
              console.error(`Eroare la actualizarea UUID pentru utilizatorul ${user.id}:`, err);
            } else {
              console.log(`UUID scurt adăugat pentru utilizatorul ${user.id}: ${shortUUID}`);
            }
          });
        });
      });

      // Creăm utilizatorul admin după ce tabelele sunt create
      createAdminUser();
    }
  });

  // Creăm tabelul documents dacă nu există
  db.run(`CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    user_uuid TEXT NOT NULL,
    document_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (user_uuid) REFERENCES users(uuid),
    UNIQUE(user_uuid, document_type)
  )`, (err) => {
    if (err) {
      console.error('Eroare la crearea tabelului documents:', err);
    } else {
      console.log('Tabelul documents a fost creat sau există deja');
    }
  });
});

async function createAdminUser() {
  try {
    const adminEmail = 'admin@example.com';
    const adminPassword = await bcrypt.hash('admin07', 10);
    const testUserEmail = 'user3@example.com';
    const testUserPassword = await bcrypt.hash('123', 10);

    console.log('Începem crearea utilizatorilor...');

    // Creăm admin-ul
    const adminExists = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE email = ?', [adminEmail], (err, user) => {
        if (err) {
          console.error('Eroare la verificarea admin:', err);
          reject(err);
        } else {
          resolve(user);
        }
      });
    });

    if (!adminExists) {
      await new Promise((resolve, reject) => {
        const adminUUID = generateShortUUID();
        db.run(
          'INSERT INTO users (uuid, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
          [adminUUID, adminEmail, adminPassword, 'Administrator', 'admin'],
          function(err) {
            if (err) {
              console.error('Eroare la crearea admin:', err);
              reject(err);
            } else {
              console.log('Utilizator admin creat cu succes, ID:', this.lastID, 'UUID:', adminUUID);
              resolve();
            }
          }
        );
      });
    } else {
      console.log('Utilizator admin existent, ID:', adminExists.id);
    }

    // Creăm utilizatorul de test
    const testUserExists = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE email = ?', [testUserEmail], (err, user) => {
        if (err) {
          console.error('Eroare la verificarea utilizatorului de test:', err);
          reject(err);
        } else {
          resolve(user);
        }
      });
    });

    if (!testUserExists) {
      await new Promise((resolve, reject) => {
        const testUserUUID = generateShortUUID();
        db.run(
          'INSERT INTO users (uuid, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
          [testUserUUID, testUserEmail, testUserPassword, 'Test User', 'user'],
          function(err) {
            if (err) {
              console.error('Eroare la crearea utilizatorului de test:', err);
              reject(err);
            } else {
              console.log('Utilizator de test creat cu succes, ID:', this.lastID, 'UUID:', testUserUUID);
              resolve();
            }
          }
        );
      });
    } else {
      console.log('Utilizator de test existent, ID:', testUserExists.id);
    }
  } catch (error) {
    console.error('Eroare la crearea utilizatorilor:', error);
  }
}

module.exports = db;