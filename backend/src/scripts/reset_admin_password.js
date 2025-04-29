const { User } = require('../models');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
  try {
    const adminEmail = 'admin@example.com';
    const newPassword = '123'; // Parola corectă pentru admin

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [updated] = await User.update(
      { password: hashedPassword },
      { where: { email: adminEmail } }
    );

    if (updated) {
      console.log('Parola administratorului a fost resetată cu succes.');
      console.log('Email:', adminEmail);
      console.log('Parola nouă:', newPassword);
    } else {
      console.log('Nu s-a găsit utilizatorul admin.');
    }
  } catch (error) {
    console.error('Eroare la resetarea parolei:', error);
  } finally {
    process.exit();
  }
}

resetAdminPassword(); 