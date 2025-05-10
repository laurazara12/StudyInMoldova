City.associate = (models) => {
  City.hasMany(models.University, { 
    foreignKey: 'city_id',
    as: 'universities'
  });
}; 