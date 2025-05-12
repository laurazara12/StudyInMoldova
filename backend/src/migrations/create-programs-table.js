const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.tableExists('programs');
    if (!tableExists) {
      await queryInterface.createTable('programs', {
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
          allowNull: false,
          defaultValue: []
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        duration: {
          type: DataTypes.STRING,
          allowNull: false
        },
        tuition_fee: {
          type: DataTypes.STRING,
          allowNull: false
        },
        university_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'universities',
            key: 'id'
          }
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        }
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.tableExists('programs');
    if (tableExists) {
      await queryInterface.dropTable('programs');
    }
  }
}; 