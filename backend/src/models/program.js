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
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: true
    },
    degree: {
      type: DataTypes.STRING,
      allowNull: true
    },
    degree_type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    language: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tuition_fees: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    faculty: {
      type: DataTypes.STRING,
      allowNull: true
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    application_deadline: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    university_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'universities',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  }, {
    timestamps: true,
    tableName: 'programs',
    underscored: true
  });

  Program.associate = (models) => {
    Program.belongsTo(models.University, {
      foreignKey: 'university_id',
      as: 'university',
      onDelete: 'CASCADE'
    });
    
    Program.hasMany(models.Application, {
      foreignKey: 'program_id',
      as: 'applications',
      onDelete: 'CASCADE'
    });
    
    Program.hasMany(models.SavedProgram, {
      foreignKey: 'program_id',
      as: 'savedPrograms',
      onDelete: 'CASCADE'
    });
  };

  return Program;
}; 