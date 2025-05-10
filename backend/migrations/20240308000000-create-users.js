'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('user', 'admin'),
        defaultValue: 'user'
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      date_of_birth: {
        type: Sequelize.DATE,
        allowNull: true
      },
      country_of_origin: {
        type: Sequelize.STRING,
        allowNull: true
      },
      nationality: {
        type: Sequelize.STRING,
        allowNull: true
      },
      desired_study_level: {
        type: Sequelize.STRING,
        allowNull: true
      },
      preferred_study_field: {
        type: Sequelize.STRING,
        allowNull: true
      },
      desired_academic_year: {
        type: Sequelize.STRING,
        allowNull: true
      },
      preferred_study_language: {
        type: Sequelize.STRING,
        allowNull: true
      },
      estimated_budget: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      accommodation_preferences: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  }
}; 