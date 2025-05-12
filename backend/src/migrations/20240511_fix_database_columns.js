'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adăugăm coloana imageUrl în tabela Universities
    await queryInterface.addColumn('Universities', 'imageUrl', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Corectăm numele coloanelor de timp în tabela documents
    await queryInterface.renameColumn('documents', 'createdAt', 'created_at');
    await queryInterface.renameColumn('documents', 'updatedAt', 'updated_at');

    // Corectăm numele coloanelor de timp în tabela applications
    await queryInterface.renameColumn('applications', 'createdAt', 'created_at');
    await queryInterface.renameColumn('applications', 'updatedAt', 'updated_at');
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminăm coloana imageUrl din tabela Universities
    await queryInterface.removeColumn('Universities', 'imageUrl');

    // Revenim la numele anterioare ale coloanelor de timp
    await queryInterface.renameColumn('documents', 'created_at', 'createdAt');
    await queryInterface.renameColumn('documents', 'updated_at', 'updatedAt');

    await queryInterface.renameColumn('applications', 'created_at', 'createdAt');
    await queryInterface.renameColumn('applications', 'updated_at', 'updatedAt');
  }
}; 