Report.associate = (models) => {
  Report.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  Report.belongsTo(models.Program, { foreignKey: 'program_id', as: 'program' });
}; 