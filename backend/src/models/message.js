Message.associate = (models) => {
  Message.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
}; 