const { sequelize } = require('../models');
const fs = require('fs');
const path = require('path');

async function removeUuidColumns() {
  try {
    console.log('Începe procesul de eliminare a coloanelor UUID...');
    
    // Verificăm dacă baza de date există
    const dbPath = path.join(__dirname, '../../data/database.sqlite');
    if (!fs.existsSync(dbPath)) {
      console.log('Baza de date nu există. Se va crea la următoarea pornire a serverului.');
      return;
    }
    
    // Verificăm dacă tabela users există și are coloana uuid
    const usersTableExists = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='users'",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (usersTableExists.length > 0) {
      // Verificăm dacă coloana uuid există
      const uuidColumnExists = await sequelize.query(
        "PRAGMA table_info(users)",
        { type: sequelize.QueryTypes.SELECT }
      ).then(columns => columns.some(col => col.name === 'uuid'));
      
      if (uuidColumnExists) {
        console.log('Se șterge coloana uuid din tabela users...');
        // Creăm o tabelă temporară fără coloana uuid
        await sequelize.query(`
          CREATE TABLE users_temp (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user'
          )
        `);
        
        // Copiem datele din tabela veche în cea nouă
        await sequelize.query(`
          INSERT INTO users_temp (id, name, email, password, role)
          SELECT id, name, email, password, role FROM users
        `);
        
        // Ștergem tabela veche
        await sequelize.query(`DROP TABLE users`);
        
        // Redenumim tabela temporară
        await sequelize.query(`ALTER TABLE users_temp RENAME TO users`);
        
        console.log('Coloana uuid a fost ștearsă din tabela users.');
      } else {
        console.log('Tabela users nu are coloana uuid.');
      }
    } else {
      console.log('Tabela users nu există.');
    }
    
    // Verificăm dacă tabela documents există și are coloana user_uuid
    const documentsTableExists = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='documents'",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (documentsTableExists.length > 0) {
      // Verificăm dacă coloana user_uuid există
      const userUuidColumnExists = await sequelize.query(
        "PRAGMA table_info(documents)",
        { type: sequelize.QueryTypes.SELECT }
      ).then(columns => columns.some(col => col.name === 'user_uuid'));
      
      if (userUuidColumnExists) {
        console.log('Se șterge coloana user_uuid din tabela documents...');
        // Creăm o tabelă temporară fără coloana user_uuid
        await sequelize.query(`
          CREATE TABLE documents_temp (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            document_type TEXT NOT NULL,
            file_path TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Copiem datele din tabela veche în cea nouă
        await sequelize.query(`
          INSERT INTO documents_temp (id, user_id, document_type, file_path, created_at)
          SELECT id, user_id, document_type, file_path, created_at FROM documents
        `);
        
        // Ștergem tabela veche
        await sequelize.query(`DROP TABLE documents`);
        
        // Redenumim tabela temporară
        await sequelize.query(`ALTER TABLE documents_temp RENAME TO documents`);
        
        console.log('Coloana user_uuid a fost ștearsă din tabela documents.');
      } else {
        console.log('Tabela documents nu are coloana user_uuid.');
      }
    } else {
      console.log('Tabela documents nu există.');
    }
    
    // Verificăm dacă tabela notifications există și are coloana user_uuid
    const notificationsTableExists = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='notifications'",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (notificationsTableExists.length > 0) {
      // Verificăm dacă coloana user_uuid există
      const userUuidColumnExists = await sequelize.query(
        "PRAGMA table_info(notifications)",
        { type: sequelize.QueryTypes.SELECT }
      ).then(columns => columns.some(col => col.name === 'user_uuid'));
      
      if (userUuidColumnExists) {
        console.log('Se șterge coloana user_uuid din tabela notifications...');
        // Creăm o tabelă temporară fără coloana user_uuid
        await sequelize.query(`
          CREATE TABLE notifications_temp (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            read INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Copiem datele din tabela veche în cea nouă
        await sequelize.query(`
          INSERT INTO notifications_temp (id, user_id, message, read, created_at)
          SELECT id, user_id, message, read, created_at FROM notifications
        `);
        
        // Ștergem tabela veche
        await sequelize.query(`DROP TABLE notifications`);
        
        // Redenumim tabela temporară
        await sequelize.query(`ALTER TABLE notifications_temp RENAME TO notifications`);
        
        console.log('Coloana user_uuid a fost ștearsă din tabela notifications.');
      } else {
        console.log('Tabela notifications nu are coloana user_uuid.');
      }
    } else {
      console.log('Tabela notifications nu există.');
    }
    
    console.log('Procesul de eliminare a coloanelor UUID a fost finalizat cu succes.');
  } catch (error) {
    console.error('Eroare la eliminarea coloanelor UUID:', error);
  } finally {
    // Închidem conexiunea la baza de date
    await sequelize.close();
  }
}

// Rulăm funcția
removeUuidColumns(); 