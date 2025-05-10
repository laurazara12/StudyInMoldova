Country.associate = (models) => {
  Country.hasMany(models.University, { 
    foreignKey: 'country_id',
    as: 'universities'
  });
}; 