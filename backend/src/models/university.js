const { Model, DataTypes } = require('sequelize');

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
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ranking: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tuition_fees: {
      type: DataTypes.JSON,
      allowNull: true
    },
    programs: {
      type: DataTypes.JSON,
      allowNull: true
    },
    contact_info: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    tableName: 'universities',
    timestamps: true,
    underscored: true
  });

  University.associate = (models) => {
    University.hasMany(models.Program, {
      foreignKey: 'university_id',
      as: 'Programs'
    });
  };

  return University;
}; 