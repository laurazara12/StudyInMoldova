Comment.associate = (models) => {
  Comment.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  Comment.belongsTo(models.Program, { foreignKey: 'program_id', as: 'program' });
}; 