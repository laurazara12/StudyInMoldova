Language.associate = (models) => {
  Language.belongsToMany(models.Program, { 
    through: 'ProgramLanguage',
    foreignKey: 'language_id',
    otherKey: 'program_id',
    as: 'programs'
  });
}; 