Review.associate = (models) => {
  Review.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  Review.belongsTo(models.Program, { foreignKey: 'program_id', as: 'program' });
}; 