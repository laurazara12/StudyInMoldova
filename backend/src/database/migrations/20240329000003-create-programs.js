'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('programs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      duration: {
        type: Sequelize.STRING,
        allowNull: true
      },
      degree: {
        type: Sequelize.STRING,
        allowNull: true
      },
      degree_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      language: {
        type: Sequelize.STRING,
        allowNull: true
      },
      tuition_fees: {
        type: Sequelize.STRING,
        allowNull: true
      },
      credits: {
        type: Sequelize.STRING,
        allowNull: true
      },
      faculty: {
        type: Sequelize.STRING,
        allowNull: true
      },
      university_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'universities',
          key: 'id'
        }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex('programs', ['university_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('programs');
  }
}; 