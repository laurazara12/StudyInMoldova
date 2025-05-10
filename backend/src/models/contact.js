Contact.associate = (models) => {
  Contact.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
}; 