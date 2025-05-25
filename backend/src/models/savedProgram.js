const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SavedProgram extends Model {
    static associate(models) {
      SavedProgram.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      SavedProgram.belongsTo(models.Program, {
        foreignKey: 'program_id',
        as: 'program'
      });
    }
  }

  SavedProgram.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    program_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'programs',
        key: 'id'
      }
    },
    saved_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'SavedProgram',
    tableName: 'saved_programs',
    underscored: true
  });

  return SavedProgram;
}; 