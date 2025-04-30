const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('documents', 'status', {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending'
    });
    await queryInterface.addColumn('documents', 'filename', {
      type: DataTypes.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('documents', 'originalName', {
      type: DataTypes.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('documents', 'status');
    await queryInterface.removeColumn('documents', 'filename');
    await queryInterface.removeColumn('documents', 'originalName');
  }
}; 