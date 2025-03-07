// /backend/src/config/database.js
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
require('dotenv').config();

const db = new sqlite3.Database(
  process.env.DB_PATH,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error('Eroare la conectarea la baza de date:', err);
    } else {
      console.log('Conectat la baza de date SQLite');
      initializeDatabase();
    }
  }
);

function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, [], async (err) => {
    if (err) {
      console.error('Eroare la crearea tabelului:', err);
    } else {
      console.log('Tabel users creat sau existent');
      await createAdminUser();
    }
  });
}

async function createAdminUser() {
  const adminEmail = 'admin@example.com';
  const adminPassword = await bcrypt.hash('admin07', 10);

  db.get('SELECT id FROM users WHERE email = ?', [adminEmail], (err, user) => {
    if (!user) {
      db.run(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        [adminEmail, adminPassword, 'Administrator', 'admin'],
        (err) => {
          if (err) {
            console.error('Eroare la crearea admin:', err);
          } else {
            console.log('Utilizator admin creat cu succes');
          }
        }
      );
    }
  });
}

module.exports = db;