'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Redenumim coloanele pentru tabela documents
    await queryInterface.renameColumn('documents', 'created_at', 'createdAt');
    await queryInterface.renameColumn('documents', 'updated_at', 'updatedAt');

    // Redenumim coloanele pentru tabela applications
    await queryInterface.renameColumn('applications', 'created_at', 'createdAt');
    await queryInterface.renameColumn('applications', 'updated_at', 'updatedAt');
  },

  down: async (queryInterface, Sequelize) => {
    // Revenim la denumirile anterioare pentru tabela documents
    await queryInterface.renameColumn('documents', 'createdAt', 'created_at');
    await queryInterface.renameColumn('documents', 'updatedAt', 'updated_at');

    // Revenim la denumirile anterioare pentru tabela applications
    await queryInterface.renameColumn('applications', 'createdAt', 'created_at');
    await queryInterface.renameColumn('applications', 'updatedAt', 'updated_at');
  }
}; 