const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.tableExists('documents');
    if (!tableExists) {
      await queryInterface.createTable('documents', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        document_type: {
          type: DataTypes.STRING,
          allowNull: false
        },
        file_path: {
          type: DataTypes.STRING,
          allowNull: false
        },
        status: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'pending'
        },
        filename: {
          type: DataTypes.STRING,
          allowNull: true
        },
        originalName: {
          type: DataTypes.STRING,
          allowNull: true
        },
        uploaded: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        uploadDate: {
          type: DataTypes.DATE,
          allowNull: true
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
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.tableExists('documents');
    if (tableExists) {
      await queryInterface.dropTable('documents');
    }
  }
}; 