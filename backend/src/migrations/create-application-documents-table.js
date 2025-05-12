const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.tableExists('application_documents');
    if (!tableExists) {
      await queryInterface.createTable('application_documents', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        application_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'applications',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        document_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'documents',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false
        }
      });

      // Adăugăm un index compus pentru a preveni duplicatele
      await queryInterface.addIndex('application_documents', ['application_id', 'document_id'], {
        unique: true,
        name: 'application_documents_unique'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.tableExists('application_documents');
    if (tableExists) {
      await queryInterface.dropTable('application_documents');
    }
  }
}; 