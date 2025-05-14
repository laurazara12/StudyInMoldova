'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Programs', 'degree_type', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Copiem datele din coloana degree în degree_type pentru compatibilitate
    await queryInterface.sequelize.query(`
      UPDATE Programs 
      SET degree_type = degree 
      WHERE degree IS NOT NULL
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Programs', 'degree_type');
  }
}; 