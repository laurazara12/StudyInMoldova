'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('applications', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      program_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'programs',
          key: 'id'
        }
      },
      university_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'universities',
          key: 'id'
        }
      },
      status: {
        type: Sequelize.ENUM('draft', 'submitted', 'under_review', 'accepted', 'rejected', 'withdrawn'),
        defaultValue: 'draft'
      },
      payment_status: {
        type: Sequelize.ENUM('unpaid', 'paid', 'failed'),
        defaultValue: 'unpaid'
      },
      payment_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      application_date: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW
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

    // Adăugăm indexuri pentru performanță
    await queryInterface.addIndex('applications', ['user_id']);
    await queryInterface.addIndex('applications', ['program_id']);
    await queryInterface.addIndex('applications', ['university_id']);
    await queryInterface.addIndex('applications', ['status']);
    await queryInterface.addIndex('applications', ['payment_status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('applications');
  }
}; 