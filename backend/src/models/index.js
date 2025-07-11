const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
let sequelize;

if (env === 'production') {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: 5432,
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    }
  );
} else {
  // Folosește config.json doar pentru development/test
  const config = require(__dirname + '/../config/config.json')[env];
  sequelize = new Sequelize(config);
}

const db = {};

// Încărcăm modelele în ordinea corectă
const modelFiles = [
  'user.js',
  'university.js',
  'program.js',
  'savedProgram.js',
  'application.js',
  'document.js',
  'notification.js',
  'applicationDocument.js'
];

modelFiles.forEach(file => {
  const model = require(path.join(__dirname, file))(sequelize);
  db[model.name] = model;
});

// Definim asocierile
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db; 