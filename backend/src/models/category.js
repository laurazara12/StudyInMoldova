Category.associate = (models) => {
  Category.belongsToMany(models.Program, { 
    through: 'ProgramCategory',
    foreignKey: 'category_id',
    otherKey: 'program_id',
    as: 'programs'
  });
}; 