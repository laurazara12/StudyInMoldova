const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Verificăm dacă coloana status există
    const statusColumn = await queryInterface.describeTable('documents').then(columns => columns.status);
    if (!statusColumn) {
      await queryInterface.addColumn('documents', 'status', {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending'
      });
    }

    // Verificăm dacă coloana filename există
    const filenameColumn = await queryInterface.describeTable('documents').then(columns => columns.filename);
    if (!filenameColumn) {
      await queryInterface.addColumn('documents', 'filename', {
        type: DataTypes.STRING,
        allowNull: true
      });
    }

    // Verificăm dacă coloana originalName există
    const originalNameColumn = await queryInterface.describeTable('documents').then(columns => columns.originalName);
    if (!originalNameColumn) {
      await queryInterface.addColumn('documents', 'originalName', {
        type: DataTypes.STRING,
        allowNull: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('documents', 'status');
    await queryInterface.removeColumn('documents', 'filename');
    await queryInterface.removeColumn('documents', 'originalName');
  }
}; 