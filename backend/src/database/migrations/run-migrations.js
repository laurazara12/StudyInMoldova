const { sequelize } = require('../config/database');
const addStatusToDocuments = require('./add-status-to-documents');
const createSavedProgramsTable = require('./create-saved-programs-table');
const createProgramsTable = require('./create-programs-table');
const createUsersTable = require('./create-users-table');
const createDocumentsTable = require('./create-documents-table');

async function runMigrations() {
  try {
    console.log('Începe rularea migrărilor...');
    
    // 1. Creează tabela users (necesară pentru documents și saved_programs)
    await createUsersTable.up(sequelize.getQueryInterface(), sequelize);
    console.log('Tabela users creată cu succes');
    
    // 2. Creează tabela documents
    await createDocumentsTable.up(sequelize.getQueryInterface(), sequelize);
    console.log('Tabela documents creată cu succes');
    
    // 3. Adaugă coloane suplimentare la documents
    await addStatusToDocuments.up(sequelize.getQueryInterface(), sequelize);
    console.log('Coloane adăugate la tabela documents');
    
    // 4. Creează tabela Programs
    await createProgramsTable.up(sequelize.getQueryInterface(), sequelize);
    console.log('Tabela programs creată cu succes');
    
    // 5. Creează tabela saved_programs (necesită users și programs)
    await createSavedProgramsTable.up(sequelize.getQueryInterface(), sequelize);
    console.log('Tabela saved_programs creată cu succes');
    
    console.log('Migrările au fost rulate cu succes!');
    process.exit(0);
  } catch (error) {
    console.error('Eroare la rularea migrărilor:', error);
    process.exit(1);
  }
}

runMigrations(); 