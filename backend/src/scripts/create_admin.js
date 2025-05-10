const bcrypt = require('bcrypt');
const { User } = require('../models');

async function createAdmin() {
  try {
    // Verificăm dacă există deja un admin cu acest email
    const existingAdmin = await User.findOne({
      where: { email: 'admin@example.com' }
    });

    if (existingAdmin) {
      console.log('Administratorul existent a fost găsit. Se actualizează parola...');
      const hashedPassword = await bcrypt.hash('123', 10);
      await existingAdmin.update({
        password: hashedPassword
      });
      console.log('Parola administratorului a fost actualizată cu succes.');
      console.log('Email:', existingAdmin.email);
      console.log('Parolă nouă: 123');
      return;
    }

    // Dacă nu există, creăm noul admin
    const hashedPassword = await bcrypt.hash('123', 10);
    const admin = await User.create({
      name: 'Administrator',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Administrator creat cu succes:');
    console.log('Email:', admin.email);
    console.log('Parolă: 123');
  } catch (error) {
    console.error('Eroare la crearea/actualizarea administratorului:', error);
  } finally {
    process.exit();
  }
}

createAdmin(); 