'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('programs', 'degree_type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Bachelor'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('programs', 'degree_type');
  }
}; 