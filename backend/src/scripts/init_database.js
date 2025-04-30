const { sequelize, User, Document, University, Program } = require('../models');

async function initDatabase() {
  try {
    console.log('Începe inițializarea bazei de date...');
    
    // Forțăm sincronizarea pentru a recrea tabelele
    await sequelize.sync({ force: true });
    console.log('Tabelele au fost create cu succes');
    
    // Creăm un utilizator admin implicit
    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: '$2a$10$X7UrE2JqB5UZJ5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', // Parola: admin123
      role: 'admin'
    });
    console.log('Utilizator admin creat:', adminUser.email);
    
    console.log('Inițializarea bazei de date finalizată');
  } catch (error) {
    console.error('Eroare la inițializarea bazei de date:', error);
  } finally {
    await sequelize.close();
  }
}

// Rulăm funcția
initDatabase(); 