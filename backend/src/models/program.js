const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Program extends Model {
    static associate(models) {
      Program.belongsTo(models.University, {
        foreignKey: 'university_id',
        as: 'University'
      });
      Program.hasMany(models.SavedProgram, {
        foreignKey: 'programId',
        as: 'SavedPrograms'
      });
    }
  }

  Program.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
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
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    application_deadline: {
      type: DataTypes.DATE,
      allowNull: false
    },
    requirements: {
      type: DataTypes.TEXT
    },
    university_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'universities',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Program',
    tableName: 'programs',
    underscored: true
  });

  return Program;
}; 