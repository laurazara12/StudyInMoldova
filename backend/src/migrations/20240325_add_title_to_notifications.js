'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('notifications', 'title', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'Notificare nouă'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('notifications', 'title');
  }
}; 