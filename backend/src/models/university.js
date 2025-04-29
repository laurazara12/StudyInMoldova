const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const University = sequelize.define('University', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ranking: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tuitionFees: {
      type: DataTypes.JSON,
      allowNull: true
    },
    programs: {
      type: DataTypes.JSON,
      allowNull: true
    },
    contactInfo: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    tableName: 'Universities',
    timestamps: false
  });

  return University;
}; 