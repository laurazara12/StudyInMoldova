const { User } = require('../models');
const bcrypt = require('bcryptjs');

async function recreateAdmin() {
  try {
    // Ștergem utilizatorul admin existent
    await User.destroy({
      where: { email: 'admin@example.com' }
    });

    // Creăm un nou utilizator admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Administrator',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active'
    });

    console.log('Utilizatorul admin a fost recreat cu succes:');
    console.log('ID:', admin.id);
    console.log('Email:', admin.email);
    console.log('Rol:', admin.role);
    console.log('Parola hash:', admin.password);
  } catch (error) {
    console.error('Eroare la recrearea utilizatorului admin:', error);
  } finally {
    process.exit();
  }
}

recreateAdmin(); 