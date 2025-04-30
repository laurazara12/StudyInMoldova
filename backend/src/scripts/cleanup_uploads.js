const fs = require('fs');
const path = require('path');
const { sequelize, Document, User } = require('../models');

const uploadsDir = path.join(__dirname, '../../uploads');

async function cleanupUploads() {
  try {
    console.log('Începe curățarea folderelor de upload...');

    // Verificăm dacă directorul uploads există
    if (!fs.existsSync(uploadsDir)) {
      console.log('Directorul uploads nu există.');
      return;
    }

    // Obținem toate folderele din directorul uploads
    const folders = fs.readdirSync(uploadsDir);
    console.log(`Foldere găsite în uploads: ${folders.length}`);

    // Obținem toți utilizatorii activi din baza de date
    const users = await User.findAll({
      attributes: ['id']
    });
    const userIds = users.map(user => user.id.toString());
    console.log(`Utilizatori activi în baza de date: ${userIds.length}`);

    // Obținem toate documentele din baza de date
    const documents = await Document.findAll({
      attributes: ['user_id', 'file_path']
    });
    console.log(`Documente în baza de date: ${documents.length}`);

    // Pentru fiecare folder din uploads
    for (const folder of folders) {
      const folderPath = path.join(uploadsDir, folder);
      
      // Verificăm dacă este un director
      if (!fs.statSync(folderPath).isDirectory()) {
        console.log(`${folder} nu este un director, se ignoră.`);
        continue;
      }

      // Verificăm dacă folderul aparține unui utilizator activ
      if (!userIds.includes(folder)) {
        console.log(`Folderul ${folder} nu aparține niciunui utilizator activ, se șterge...`);
        fs.rmSync(folderPath, { recursive: true, force: true });
        continue;
      }

      // Verificăm dacă utilizatorul are documente
      const userDocuments = documents.filter(doc => doc.user_id.toString() === folder);
      if (userDocuments.length === 0) {
        console.log(`Utilizatorul ${folder} nu are documente, se șterge folderul...`);
        fs.rmSync(folderPath, { recursive: true, force: true });
        continue;
      }

      // Verificăm fișierele din folder
      const files = fs.readdirSync(folderPath);
      for (const file of files) {
        const filePath = path.join(folderPath, file);
        const isUsed = userDocuments.some(doc => {
          const docPath = doc.file_path;
          return docPath && (
            docPath === filePath || 
            path.basename(docPath) === file
          );
        });

        if (!isUsed) {
          console.log(`Fișierul ${file} nu este folosit, se șterge...`);
          fs.unlinkSync(filePath);
        }
      }

      // Verificăm dacă folderul a rămas gol
      const remainingFiles = fs.readdirSync(folderPath);
      if (remainingFiles.length === 0) {
        console.log(`Folderul ${folder} este gol, se șterge...`);
        fs.rmdirSync(folderPath);
      }
    }

    console.log('Curățarea folderelor de upload finalizată.');
  } catch (error) {
    console.error('Eroare la curățarea folderelor:', error);
  } finally {
    await sequelize.close();
  }
}

// Rulăm funcția
cleanupUploads(); 