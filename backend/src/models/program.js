const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Program extends Model {
    static associate(models) {
      Program.belongsTo(models.University, {
        foreignKey: 'university_id',
        as: 'University'
      });
      Program.hasMany(models.SavedProgram, {
        foreignKey: 'program_id',
        as: 'savedPrograms'
      });
    }
  }

  Program.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    degree_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tuition_fees: {
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
    faculty: {
      type: DataTypes.STRING,
      allowNull: true
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Program',
    tableName: 'programs',
    underscored: true
  });

  return Program;
}; 