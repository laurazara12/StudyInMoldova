Rating.associate = (models) => {
  Rating.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  Rating.belongsTo(models.Program, { foreignKey: 'program_id', as: 'program' });
}; 