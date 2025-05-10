Address.associate = (models) => {
  Address.belongsTo(models.University, { 
    foreignKey: 'university_id',
    as: 'university'
  });
}; 