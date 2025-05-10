Scholarship.associate = (models) => {
  Scholarship.belongsTo(models.Program, { foreignKey: 'program_id', as: 'program' });
  Scholarship.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
}; 