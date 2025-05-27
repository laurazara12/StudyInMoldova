'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('applications', 'application_date', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.NOW
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('applications', 'application_date');
  }
}; 