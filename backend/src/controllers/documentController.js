const { Document } = require('../models');
const { createNotification } = require('./notificationController');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const cloudinary = require('../config/cloudinary');

const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_message } = req.body;
    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(404).json({ 
        success: false,
        message: 'Documentul nu a fost găsit',
        data: null
      });
    }

    // Ștergere din Cloudinary
    if (document.filename) {
      await cloudinary.uploader.destroy(document.filename);
    }

    // Create notification for the user before deleting the document
    await createNotification(
      document.user_id,
      'document_deleted',
      `Documentul de tip ${document.document_type} a fost șters de administrator`,
      document.id,
      admin_message
    );

    // Delete document from database
    await document.destroy();

    res.json({ 
      success: true,
      message: 'Documentul a fost șters cu succes',
      data: null
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la ștergerea documentului',
      error: error.message,
      data: null
    });
  }
};

exports.getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({
      where: {
        status: {
          [Op.not]: 'deleted'
        }
      },
      attributes: ['id', 'document_type', 'file_path', 'createdAt', 'status', 'filename', 'originalName', 'user_id'],
      order: [['createdAt', 'DESC']]
    });

    console.log('Număr total de documente găsite:', documents.length);

    const formattedDocuments = documents.map(doc => ({
      id: doc.id,
      document_type: doc.document_type,
      file_path: doc.file_path,
      createdAt: doc.createdAt,
      status: doc.status || 'pending',
      filename: doc.filename,
      originalName: doc.originalName,
      user_id: doc.user_id
    }));

    // Calculăm statisticile doar dacă avem documente
    const statusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0
    };

    if (documents.length > 0) {
      documents.forEach(doc => {
        const status = doc.status || 'pending';
        if (statusCounts.hasOwnProperty(status)) {
          statusCounts[status]++;
        }
      });
    }

    const response = {
      success: true,
      message: 'Documentele au fost preluate cu succes',
      data: formattedDocuments,
      total: documents.length,
      status: statusCounts
    };

    console.log('Răspuns getAllDocuments:', {
      totalDocuments: documents.length,
      statusCounts: statusCounts
    });

    res.json(response);
  } catch (error) {
    console.error('Eroare la preluarea documentelor:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la preluarea documentelor',
      error: error.message,
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

exports.getDocumentById = async (req, res) => {
  try {
    console.log('Căutare document cu ID:', req.params.id);
    
    const document = await Document.findOne({
      where: {
        id: req.params.id,
        status: {
          [Op.not]: 'deleted'
        }
      },
      attributes: ['id', 'document_type', 'file_path', 'createdAt', 'status', 'filename', 'originalName']
    });

    console.log('Document găsit:', document ? {
      id: document.id,
      status: document.status,
      document_type: document.document_type
    } : 'Nu a fost găsit');

    if (!document) {
      return res.status(404).json({ 
        success: false,
        message: 'Documentul nu a fost găsit',
        data: null
      });
    }

    // Formatăm documentul pentru a ne asigura că are toate proprietățile necesare
    const formattedDocument = {
      id: document.id,
      document_type: document.document_type,
      file_path: document.file_path,
      createdAt: document.createdAt,
      status: document.status || 'pending',
      filename: document.filename,
      originalName: document.originalName
    };

    res.json({
      success: true,
      message: 'Documentul a fost preluat cu succes',
      data: formattedDocument
    });
  } catch (error) {
    console.error('Eroare la preluarea documentului:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la preluarea documentului',
      error: error.message,
      data: null
    });
  }
};

exports.createDocument = async (req, res) => {
  try {
    const { document_type } = req.body;
    const user_id = req.user.id;

    console.log('Încărcare document nou:', {
      originalName: req.file?.originalname,
      document_type,
      user_id
    });

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nu s-a încărcat niciun fișier',
        data: null
      });
    }

    // Încărcare pe Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `documents/${user_id}`,
      resource_type: "auto"
    });

    console.log('Rezultat încărcare Cloudinary:', {
      public_id: result.public_id,
      secure_url: result.secure_url
    });

    // Creăm documentul cu toate proprietățile necesare
    const documentData = {
      user_id,
      document_type,
      file_path: result.secure_url,
      filename: result.public_id,
      originalName: req.file.originalname,
      status: 'pending',
      uploaded: true,
      uploadDate: new Date()
    };

    const document = await Document.create(documentData);

    // Formatăm documentul pentru răspuns
    const formattedDocument = {
      id: document.id,
      document_type: document.document_type,
      file_path: document.file_path,
      createdAt: document.createdAt,
      status: document.status || 'pending',
      filename: document.filename,
      originalName: document.originalName,
      uploaded: document.uploaded,
      uploadDate: document.uploadDate
    };

    console.log('Document creat în baza de date:', {
      id: document.id,
      originalName: document.originalName,
      filename: document.filename,
      status: document.status
    });

    res.status(201).json({
      success: true,
      message: 'Documentul a fost creat cu succes',
      data: formattedDocument
    });
  } catch (error) {
    console.error('Eroare la crearea documentului:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la crearea documentului',
      error: error.message,
      data: null
    });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const { status, document_type, file_path, filename, originalName } = req.body;
    console.log('ID document căutat:', req.params.id);
    console.log('Date primite:', req.body);
    
    const document = await Document.findOne({
      where: {
        id: req.params.id,
        status: {
          [Op.not]: 'deleted'
        }
      }
    });

    console.log('Document găsit:', {
      id: document?.id,
      originalName: document?.originalName,
      filename: document?.filename,
      status: document?.status
    });

    if (!document) {
      return res.status(404).json({ 
        success: false,
        message: 'Documentul nu a fost găsit',
        data: null
      });
    }

    // Verificăm dacă statusul este valid
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status invalid. Statusurile valide sunt: pending, approved, rejected',
        data: null
      });
    }

    // Actualizăm documentul
    const updateData = {};
    if (status) updateData.status = status;
    if (document_type) updateData.document_type = document_type;
    if (file_path) updateData.file_path = file_path;
    if (filename) updateData.filename = filename;
    if (originalName) updateData.originalName = originalName;

    await document.update(updateData);

    // Creăm o notificare pentru utilizator
    if (status) {
      const notificationType = status === 'approved' ? 'document_approved' : 
                             status === 'rejected' ? 'document_rejected' : 
                             'document_updated';
      
      await createNotification(
        document.user_id,
        notificationType,
        `Documentul de tip ${document.document_type} a fost ${status === 'approved' ? 'aprobat' : 
                                                           status === 'rejected' ? 'respins' : 
                                                           'actualizat'}`,
        document.id
      );
    }

    res.json({
      success: true,
      message: 'Documentul a fost actualizat cu succes',
      data: document
    });
  } catch (error) {
    console.error('Eroare la actualizarea documentului:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la actualizarea documentului',
      error: error.message,
      data: null
    });
  }
};

exports.deleteDocument = deleteDocument;

exports.getUserDocuments = async (req, res) => {
  try {
    console.log('Începe preluarea documentelor pentru utilizatorul:', req.user.id);
    
    const documents = await Document.findAll({
      where: { 
        user_id: req.user.id,
        status: {
          [Op.not]: 'deleted'
        }
      },
      attributes: ['id', 'document_type', 'file_path', 'createdAt', 'status', 'filename', 'originalName'],
      order: [['createdAt', 'DESC']]
    });

    console.log('Documente găsite în baza de date:', documents.length);

    const formattedDocuments = documents.map(doc => ({
      id: doc.id,
      document_type: doc.document_type,
      file_path: doc.file_path,
      createdAt: doc.createdAt,
      status: doc.status || 'pending',
      filename: doc.filename,
      originalName: doc.originalName,
      uploaded: true,
      uploadDate: doc.createdAt
    }));

    const statusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0
    };

    if (documents.length > 0) {
      documents.forEach(doc => {
        const status = doc.status || 'pending';
        if (statusCounts.hasOwnProperty(status)) {
          statusCounts[status]++;
        }
      });
    }

    const response = {
      success: true,
      message: documents.length === 0 ? 'La moment nu există documente încărcate în profilul dumneavoastră' : 'Documentele au fost preluate cu succes',
      data: formattedDocuments,
      total: documents.length,
      status: statusCounts
    };

    console.log('Se trimite răspuns:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error('Eroare la preluarea documentelor:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la preluarea documentelor',
      error: error.message,
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

module.exports = {
  deleteDocument: exports.deleteDocument,
  getDocumentById: exports.getDocumentById,
  createDocument: exports.createDocument,
  updateDocument: exports.updateDocument,
  getUserDocuments: exports.getUserDocuments,
  getAllDocuments: exports.getAllDocuments
}; 