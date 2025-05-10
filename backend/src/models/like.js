Like.associate = (models) => {
  Like.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  Like.belongsTo(models.Program, { foreignKey: 'program_id', as: 'program' });
}; 