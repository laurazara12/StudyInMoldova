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

    res.json({
      success: true,
      message: 'Documentele au fost preluate cu succes',
      data: documents,
      total: documents.length
    });
  } catch (error) {
    console.error('Eroare la preluarea documentelor:', error);
    res.status(500).json({ 
      success: false,
      message: 'Eroare la preluarea documentelor',
      error: error.message,
      data: [],
      total: 0
    });
  }
};

exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findOne({
      where: {
        id: req.params.id,
        status: {
          [Op.not]: 'deleted'
        }
      },
      attributes: ['id', 'document_type', 'file_path', 'createdAt', 'status', 'filename', 'originalName']
    });

    if (!document) {
      return res.status(404).json({ 
        success: false,
        message: 'Documentul nu a fost găsit',
        data: null
      });
    }

    res.json({
      success: true,
      message: 'Documentul a fost preluat cu succes',
      data: document
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nu s-a încărcat niciun fișier'
      });
    }

    // Încărcare pe Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `documents/${user_id}`,
      resource_type: "auto"
    });

    const document = await Document.create({
      user_id,
      document_type,
      file_path: result.secure_url,
      filename: result.public_id,
      originalName: req.file.originalname,
      status: 'pending',
      uploaded: true,
      uploadDate: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Documentul a fost creat cu succes',
      data: document
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
    const { document_type, file_path, filename, originalName } = req.body;
    const document = await Document.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
        status: {
          [Op.not]: 'deleted'
        }
      }
    });

    if (!document) {
      return res.status(404).json({ 
        success: false,
        message: 'Documentul nu a fost găsit',
        data: null
      });
    }

    document.document_type = document_type;
    document.file_path = file_path;
    document.filename = filename;
    document.originalName = originalName;
    await document.save();

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

    const response = {
      success: true,
      message: documents.length === 0 ? 'La moment nu există documente încărcate în profilul dumneavoastră' : 'Documentele au fost preluate cu succes',
      data: formattedDocuments,
      total: documents.length,
      status: {
        pending: documents.filter(doc => doc.status === 'pending').length,
        approved: documents.filter(doc => doc.status === 'approved').length,
        rejected: documents.filter(doc => doc.status === 'rejected').length
      }
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