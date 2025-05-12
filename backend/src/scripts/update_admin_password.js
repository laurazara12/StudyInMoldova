const { User } = require('../models');
const bcrypt = require('bcryptjs');

async function updateAdminPassword() {
  try {
    const adminEmail = 'admin@example.com';
    const newPassword = 'admin123';
    
    // Generăm hash-ul pentru noua parolă
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Actualizăm parola în baza de date
    const [updated] = await User.update(
      { password: hashedPassword },
      { where: { email: adminEmail } }
    );
    
    if (updated) {
      console.log('Parola administratorului a fost actualizată cu succes.');
      console.log('Email:', adminEmail);
      console.log('Parola nouă:', newPassword);
    } else {
      console.log('Nu s-a găsit utilizatorul admin.');
    }
  } catch (error) {
    console.error('Eroare la actualizarea parolei:', error);
  } finally {
    process.exit();
  }
}

updateAdminPassword(); 