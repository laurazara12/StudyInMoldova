'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adăugăm coloanele pentru tabela documents
    await queryInterface.addColumn('documents', 'created_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
    await queryInterface.addColumn('documents', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });

    // Adăugăm coloanele pentru tabela applications
    await queryInterface.addColumn('applications', 'created_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
    await queryInterface.addColumn('applications', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });

    // Adăugăm coloana pentru tabela Universities
    await queryInterface.addColumn('Universities', 'imageUrl', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Ștergem coloanele din tabela documents
    await queryInterface.removeColumn('documents', 'created_at');
    await queryInterface.removeColumn('documents', 'updated_at');

    // Ștergem coloanele din tabela applications
    await queryInterface.removeColumn('applications', 'created_at');
    await queryInterface.removeColumn('applications', 'updated_at');

    // Ștergem coloana din tabela Universities
    await queryInterface.removeColumn('Universities', 'imageUrl');
  }
}; 