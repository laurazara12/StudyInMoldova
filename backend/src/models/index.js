const { sequelize } = require('../config/database');
const UserModel = require('./user');
const UniversityModel = require('./university');
const DocumentModel = require('./document');
const ProgramModel = require('./program');

const User = UserModel(sequelize);
const University = UniversityModel(sequelize);
const Document = DocumentModel(sequelize);
const Program = ProgramModel(sequelize);

// Define relationships
Program.belongsTo(University, { foreignKey: 'universityId' });
University.hasMany(Program, { foreignKey: 'universityId' });

// Export models
module.exports = {
  User,
  University,
  Document,
  Program,
  sequelize
}; 