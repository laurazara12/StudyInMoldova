const { User } = require('../models');
const bcrypt = require('bcryptjs');

async function resetTestUser() {
  try {
    const testEmail = 'user@example.com';
    const newPassword = '123';

    // Generăm hash-ul pentru noua parolă
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('Hash generat pentru parola nouă:', hashedPassword);
    
    // Verificăm dacă utilizatorul există
    const testUser = await User.findOne({ where: { email: testEmail } });
    
    if (testUser) {
      // Verificăm parola veche
      const oldHash = testUser.password;
      console.log('Hash-ul vechi:', oldHash);
      
      // Actualizăm parola
      await testUser.update({ password: hashedPassword });
      console.log('Parola utilizatorului de test a fost resetată cu succes.');
      
      // Verificăm dacă noua parolă funcționează
      const isValid = await bcrypt.compare(newPassword, hashedPassword);
      console.log('Verificare parolă nouă:', isValid ? 'Validă' : 'Invalidă');
    } else {
      // Creăm utilizatorul dacă nu există
      await User.create({
        email: testEmail,
        password: hashedPassword,
        name: 'Test User',
        role: 'student',
        status: 'active'
      });
      console.log('Utilizatorul de test a fost creat cu succes.');
    }
    
    console.log('Email:', testEmail);
    console.log('Parola nouă:', newPassword);
  } catch (error) {
    console.error('Eroare la resetarea utilizatorului de test:', error);
  } finally {
    process.exit();
  }
}

resetTestUser(); 