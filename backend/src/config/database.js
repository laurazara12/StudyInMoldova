// /backend/src/config/database.js
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

// Creăm directorul pentru baza de date dacă nu există
const dbDirectory = path.dirname(path.join(__dirname, 'database.sqlite'));
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
  if (err) {
    console.error('Eroare la conectarea la baza de date:', err);
  } else {
    console.log('Conectat cu succes la baza de date SQLite');
    
    // Creăm tabelul users dacă nu există
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Eroare la crearea tabelei users:', err);
        return;
      }
      console.log('Tabela users a fost creată cu succes');

      // Verificăm dacă există utilizatorul admin
      db.get('SELECT * FROM users WHERE email = ?', ['admin@example.com'], (err, admin) => {
        if (err) {
          console.error('Eroare la verificarea utilizatorului admin:', err);
          return;
        }

        if (!admin) {
          // Creăm utilizatorul admin dacă nu există
          const hashedPassword = bcrypt.hashSync('admin07', 10);
          db.run(
            'INSERT INTO users (email, password, name, role, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
            ['admin@example.com', hashedPassword, 'Admin', 'admin'],
            (err) => {
              if (err) {
                console.error('Eroare la crearea utilizatorului admin:', err);
                return;
              }
              console.log('Utilizatorul admin a fost creat cu succes');
            }
          );
        } else {
          console.log('Utilizatorul admin există deja');
        }
      });
    });

    // Creăm tabelul documents dacă nu există
    db.run(`CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      document_type TEXT NOT NULL,
      file_path TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, document_type)
    )`, (err) => {
      if (err) {
        console.error('Eroare la crearea tabelului documents:', err);
      } else {
        console.log('Tabelul documents a fost creat sau există deja');
        // Creăm utilizatorul admin după ce tabelele sunt create
        createAdminUser();
      }
    });
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
        db.run(
          'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
          [adminEmail, adminPassword, 'Administrator', 'admin'],
          function(err) {
            if (err) {
              console.error('Eroare la crearea admin:', err);
              reject(err);
            } else {
              console.log('Utilizator admin creat cu succes, ID:', this.lastID);
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
        db.run(
          'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
          [testUserEmail, testUserPassword, 'User Test', 'user'],
          function(err) {
            if (err) {
              console.error('Eroare la crearea utilizatorului de test:', err);
              reject(err);
            } else {
              console.log('Utilizator de test creat cu succes, ID:', this.lastID);
              resolve();
            }
          }
        );
      });
    } else {
      console.log('Utilizator de test existent, ID:', testUserExists.id);
    }

    // Verificăm dacă utilizatorii au fost creați
    const verifyUsers = await new Promise((resolve, reject) => {
      db.all('SELECT id, email, role FROM users', (err, rows) => {
        if (err) {
          console.error('Eroare la verificarea utilizatorilor:', err);
          reject(err);
        } else {
          console.log('Utilizatori în baza de date:', rows);
          resolve(rows);
        }
      });
    });

  } catch (error) {
    console.error('Eroare în createAdminUser:', error);
  }
}

module.exports = db;