const { sequelize } = require('../config/database');
const UserModel = require('./user');
const UniversityModel = require('./university');
const DocumentModel = require('./document');
const ProgramModel = require('./program');
const NotificationModel = require('./notification');

const User = UserModel(sequelize);
const University = UniversityModel(sequelize);
const Document = DocumentModel(sequelize);
const Program = ProgramModel(sequelize);
const Notification = NotificationModel(sequelize);

// Define relationships
Program.belongsTo(University, { foreignKey: 'universityId' });
University.hasMany(Program, { foreignKey: 'universityId' });

Document.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Document, { foreignKey: 'user_id', as: 'documents' });

Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Notification.belongsTo(Document, { foreignKey: 'document_id', as: 'document' });

// Export models
module.exports = {
  User,
  University,
  Document,
  Program,
  Notification,
  sequelize
}; 