'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'current_education_level', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Users', 'current_education_field', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Users', 'current_education_institution', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Users', 'graduation_year', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('Users', 'english_level', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Users', 'additional_languages', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Users', 'study_goals', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('Users', 'previous_experience', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'current_education_level');
    await queryInterface.removeColumn('Users', 'current_education_field');
    await queryInterface.removeColumn('Users', 'current_education_institution');
    await queryInterface.removeColumn('Users', 'graduation_year');
    await queryInterface.removeColumn('Users', 'english_level');
    await queryInterface.removeColumn('Users', 'additional_languages');
    await queryInterface.removeColumn('Users', 'study_goals');
    await queryInterface.removeColumn('Users', 'previous_experience');
  }
}; 