const { sequelize } = require('../models');
const path = require('path');
const fs = require('fs');

async function runMigrations() {
  try {
    console.log('Începe rularea migrărilor...');
    
    // Citim directorul de migrări
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort();

    // Rulăm fiecare migrare în ordine
    for (const file of migrationFiles) {
      console.log(`Rulez migrarea: ${file}`);
      const migration = require(path.join(migrationsDir, file));
      await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
    }

    console.log('Migrările au fost rulate cu succes!');
    process.exit(0);
  } catch (error) {
    console.error('Eroare la rularea migrărilor:', error);
    process.exit(1);
  }
}

runMigrations(); 