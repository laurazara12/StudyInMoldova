Bookmark.associate = (models) => {
  Bookmark.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  Bookmark.belongsTo(models.Program, { foreignKey: 'program_id', as: 'program' });
}; 