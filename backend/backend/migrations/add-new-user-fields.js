'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'current_education_level', {
      type: Sequelize.ENUM('High School', 'Bachelor', 'Master', 'PhD'),
      allowNull: true
    });

    await queryInterface.addColumn('users', 'current_education_field', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'current_education_institution', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'graduation_year', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'english_level', {
      type: Sequelize.ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2'),
      allowNull: true
    });

    await queryInterface.addColumn('users', 'additional_languages', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'study_goals', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'previous_experience', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // Modificăm tipul pentru câmpurile existente
    await queryInterface.changeColumn('users', 'preferred_study_language', {
      type: Sequelize.ENUM('Romanian', 'Russian', 'English'),
      allowNull: true
    });

    await queryInterface.changeColumn('users', 'accommodation_preferences', {
      type: Sequelize.ENUM('dormitory', 'apartment', 'hostel'),
      allowNull: true
    });

    await queryInterface.changeColumn('users', 'estimated_budget', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'current_education_level');
    await queryInterface.removeColumn('users', 'current_education_field');
    await queryInterface.removeColumn('users', 'current_education_institution');
    await queryInterface.removeColumn('users', 'graduation_year');
    await queryInterface.removeColumn('users', 'english_level');
    await queryInterface.removeColumn('users', 'additional_languages');
    await queryInterface.removeColumn('users', 'study_goals');
    await queryInterface.removeColumn('users', 'previous_experience');

    // Revenim la tipurile anterioare
    await queryInterface.changeColumn('users', 'preferred_study_language', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('users', 'accommodation_preferences', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('users', 'estimated_budget', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
}; 