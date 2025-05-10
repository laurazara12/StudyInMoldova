const User = require('./User');
const Program = require('./Program');
const Application = require('./Application');
const SavedProgram = require('./SavedProgram');
const Document = require('./Document');

// Asocieri pentru Application
Application.belongsTo(User, { foreignKey: 'userId' });
Application.belongsTo(Program, { foreignKey: 'programId' });
Application.hasMany(Document, { foreignKey: 'applicationId' });

// Asocieri pentru SavedProgram
SavedProgram.belongsTo(User, { foreignKey: 'userId' });
SavedProgram.belongsTo(Program, { foreignKey: 'programId' });

// Asocieri pentru Document
Document.belongsTo(Application, { foreignKey: 'applicationId' });

// Asocieri pentru Program
Program.belongsTo(User, { as: 'UniversityPrograms', foreignKey: 'universityId' });

module.exports = {
  User,
  Program,
  Application,
  SavedProgram,
  Document
}; 