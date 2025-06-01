const { Document, Application } = require('../models');
const fs = require('fs').promises;
const path = require('path');

// Obține toate documentele (pentru admin)
exports.getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({
      include: [{
        model: Application,
        attributes: ['id', 'status']
      }]
    });

    // Formatăm documentele pentru a se potrivi cu frontend-ul
    const formattedDocuments = documents.map(doc => ({
      id: doc.id,
      document_type: doc.type,
      status: doc.status || 'pending',
      filename: doc.filePath.split('/').pop(),
      originalName: doc.filePath.split('/').pop(),
      user_id: doc.Application?.userId,
      createdAt: doc.createdAt,
      uploadDate: doc.createdAt,
      file_path: doc.filePath
    }));

    // Calculăm statisticile
    const stats = {
      pending: formattedDocuments.filter(doc => doc.status === 'pending').length,
      approved: formattedDocuments.filter(doc => doc.status === 'approved').length,
      rejected: formattedDocuments.filter(doc => doc.status === 'rejected').length
    };

    res.json({ 
      success: true,
      message: formattedDocuments.length === 0 ? 'Nu există documente în sistem' : 'Documentele au fost preluate cu succes',
      data: formattedDocuments,
      total: formattedDocuments.length,
      status: stats
    });
  } catch (error) {
    console.error('Error getting all documents:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la obținerea documentelor',
      data: [],
      total: 0,
      status: {
        pending: 0,
        approved: 0,
        rejected: 0
      }
    });
  }
};

// Obține documentele unui utilizator
exports.getUserDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({
      include: [{
        model: Application,
        where: { userId: req.user.id },
        attributes: ['id', 'status']
      }]
    });

    // Formatăm documentele pentru a se potrivi cu frontend-ul
    const formattedDocuments = documents.map(doc => ({
      id: doc.id,
      document_type: doc.type,
      status: doc.status || 'pending',
      filename: doc.filePath.split('/').pop(),
      originalName: doc.filePath.split('/').pop(),
      user_id: doc.Application?.userId,
      createdAt: doc.createdAt,
      uploadDate: doc.createdAt,
      file_path: doc.filePath
    }));

    // Calculăm statisticile
    const stats = {
      pending: formattedDocuments.filter(doc => doc.status === 'pending').length,
      approved: formattedDocuments.filter(doc => doc.status === 'approved').length,
      rejected: formattedDocuments.filter(doc => doc.status === 'rejected').length
    };

    res.json({ 
      success: true,
      message: formattedDocuments.length === 0 ? 'Nu există documente încărcate' : 'Documentele au fost preluate cu succes',
      data: formattedDocuments,
      total: formattedDocuments.length,
      status: stats
    });
  } catch (error) {
    console.error('Error getting user documents:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la obținerea documentelor',
      data: [],
      total: 0,
      status: {
        pending: 0,
        approved: 0,
        rejected: 0
      }
    });
  }
};

// Încarcă un document
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Nu s-a furnizat niciun fișier' });
    }

    const document = await Document.create({
      applicationId: req.body.applicationId,
      type: req.body.type,
      filePath: req.file.path,
      status: 'pending'
    });

    // Formatăm documentul pentru a se potrivi cu frontend-ul
    const formattedDocument = {
      id: document.id,
      document_type: document.type,
      status: document.status,
      filename: document.filePath.split('/').pop(),
      originalName: document.filePath.split('/').pop(),
      user_id: req.body.userId,
      createdAt: document.createdAt,
      uploadDate: document.createdAt,
      file_path: document.filePath
    };

    res.json({ success: true, document: formattedDocument });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ success: false, message: 'Eroare la încărcarea documentului' });
  }
};

// Șterge un document
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.documentId, {
      include: [{
        model: Application,
        attributes: ['id', 'status']
      }]
    });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Documentul nu a fost găsit' });
    }

    // Verifică dacă documentul este asociat cu o aplicație activă
    if (document.Application && document.Application.status !== 'rejected') {
      return res.status(400).json({ 
        success: false, 
        message: 'Nu se poate șterge documentul deoarece este asociat cu o aplicație activă' 
      });
    }

    // Șterge fișierul fizic
    try {
      if (document.filePath) {
        await fs.unlink(document.filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      // Continuăm cu ștergerea din baza de date chiar dacă ștergerea fișierului eșuează
    }

    // Șterge înregistrarea din baza de date
    await document.destroy();

    res.json({ 
      success: true, 
      message: 'Document șters cu succes',
      documentId: document.id
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la ștergerea documentului',
      error: error.message 
    });
  }
}; 