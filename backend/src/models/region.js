Region.associate = (models) => {
  Region.hasMany(models.University, { 
    foreignKey: 'region_id',
    as: 'universities'
  });
}; 