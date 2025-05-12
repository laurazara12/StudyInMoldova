const { User } = require('../models');

async function checkAdmin() {
  try {
    const admin = await User.findOne({
      where: { email: 'admin@example.com' }
    });

    if (admin) {
      console.log('Utilizatorul admin există:');
      console.log('ID:', admin.id);
      console.log('Email:', admin.email);
      console.log('Rol:', admin.role);
      console.log('Parola hash:', admin.password);
    } else {
      console.log('Utilizatorul admin nu există în baza de date.');
    }
  } catch (error) {
    console.error('Eroare la verificarea utilizatorului admin:', error);
  } finally {
    process.exit();
  }
}

checkAdmin(); 