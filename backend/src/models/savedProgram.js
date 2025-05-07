const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SavedProgram = sequelize.define('SavedProgram', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    programId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'programs',
        key: 'id'
      }
    },
    savedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'saved_programs',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'programId']
      }
    ]
  });

  SavedProgram.associate = (models) => {
    SavedProgram.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'User'
    });
    SavedProgram.belongsTo(models.Program, {
      foreignKey: 'programId',
      as: 'Program'
    });
  };

  return SavedProgram;
}; 