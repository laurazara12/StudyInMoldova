const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.tableExists('Programs');
    if (!tableExists) {
      await queryInterface.createTable('Programs', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        faculty: {
          type: DataTypes.STRING,
          allowNull: false
        },
        degree: {
          type: DataTypes.STRING,
          allowNull: false
        },
        credits: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        languages: {
          type: DataTypes.JSON,
          allowNull: false
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        duration: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        tuitionFee: {
          type: DataTypes.FLOAT,
          allowNull: false
        },
        universityId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'Universities',
            key: 'id'
          }
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
    const tableExists = await queryInterface.tableExists('Programs');
    if (tableExists) {
      await queryInterface.dropTable('Programs');
    }
  }
}; 