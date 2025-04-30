const { sequelize } = require('../config/database');
const addStatusToDocuments = require('./add-status-to-documents');

async function runMigrations() {
  try {
    console.log('Începe rularea migrărilor...');
    
    // Rulează migrarea pentru adăugarea coloanei status
    await addStatusToDocuments.up(sequelize.getQueryInterface(), sequelize);
    
    console.log('Migrările au fost rulate cu succes!');
    process.exit(0);
  } catch (error) {
    console.error('Eroare la rularea migrărilor:', error);
    process.exit(1);
  }
}

runMigrations(); 