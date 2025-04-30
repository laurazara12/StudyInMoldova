const { sequelize, Document } = require('../models');

async function updateDocumentTypes() {
  try {
    console.log('Începe actualizarea tipurilor de documente...');
    
    // Verificăm dacă există documente cu tipul 'photo'
    const photoDocuments = await Document.findAll({
      where: { document_type: 'photo' }
    });
    
    if (photoDocuments.length > 0) {
      console.log(`S-au găsit ${photoDocuments.length} documente cu tipul 'photo'`);
      
      // Actualizăm documentele cu tipul 'photo' la 'other'
      for (const doc of photoDocuments) {
        await doc.update({ document_type: 'other' });
        console.log(`Document ${doc.id} actualizat de la 'photo' la 'other'`);
      }
    }
    
    // Sincronizăm modelul cu baza de date
    await sequelize.sync({ alter: true });
    console.log('Baza de date sincronizată cu succes');
    
    console.log('Actualizarea tipurilor de documente finalizată');
  } catch (error) {
    console.error('Eroare la actualizarea tipurilor de documente:', error);
  } finally {
    await sequelize.close();
  }
}

// Rulăm funcția
updateDocumentTypes(); 