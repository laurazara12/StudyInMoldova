const bcrypt = require('bcryptjs');
const { User } = require('../src/models');
const { sequelize } = require('../src/config/database');

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('123', 10);
    const admin = await User.create({
      name: 'Administrator',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    });
    console.log('Admin user created:', admin.toJSON());
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
    await sequelize.close();
  }
}

createAdmin(); 