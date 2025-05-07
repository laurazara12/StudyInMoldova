const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Program = sequelize.define('Program', {
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
      allowNull: false,
      validate: {
        isIn: [['Bachelor', 'Master', 'PhD']]
      }
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    languages: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      get() {
        const rawValue = this.getDataValue('languages');
        return Array.isArray(rawValue) ? rawValue : [];
      },
      set(value) {
        this.setDataValue('languages', Array.isArray(value) ? value : [value]);
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tuitionFee: {
      type: DataTypes.STRING,
      allowNull: false
    },
    universityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'universities',
        key: 'id'
      }
    }
  }, {
    tableName: 'programs',
    timestamps: false
  });

  Program.associate = (models) => {
    Program.belongsTo(models.University, {
      foreignKey: 'universityId',
      as: 'University'
    });
    Program.hasMany(models.SavedProgram, {
      foreignKey: 'programId',
      as: 'SavedPrograms'
    });
  };

  return Program;
}; 