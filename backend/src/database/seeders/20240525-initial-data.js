'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Utilizator admin (doar câmpuri obligatorii)
    await queryInterface.bulkInsert('users', [{
      name: 'Admin',
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    }]);

    // Universități (doar câmpuri obligatorii)
    await queryInterface.bulkInsert('universities', [
      {
        name: 'Universitatea de Stat din Moldova',
        type: 'public',
        location: 'Chișinău',
        slug: 'universitatea-de-stat-din-moldova',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Universitatea Tehnică a Moldovei',
        type: 'public',
        location: 'Chișinău',
        slug: 'universitatea-tehnica-a-moldovei',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Programe (doar câmpuri obligatorii)
    await queryInterface.bulkInsert('programs', [
      {
        name: 'Informatică',
        duration: 3,
        degree_type: 'Bachelor',
        language: 'Română',
        university_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Inginerie Software',
        duration: 2,
        degree_type: 'Master',
        language: 'Engleză',
        university_id: 2,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('programs', null, {});
    await queryInterface.bulkDelete('universities', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
}; 