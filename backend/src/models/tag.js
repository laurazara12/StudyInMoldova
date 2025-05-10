Tag.associate = (models) => {
  Tag.belongsToMany(models.Program, { 
    through: 'ProgramTag',
    foreignKey: 'tag_id',
    otherKey: 'program_id',
    as: 'programs'
  });
}; 