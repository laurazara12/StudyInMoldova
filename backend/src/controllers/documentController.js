const { Document } = require('../models');
const { createNotification } = require('./notificationController');
const fs = require('fs');
const path = require('path');

const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_message } = req.body;
    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Create notification for the user before deleting the document
    await createNotification(
      document.user_id,
      'document_deleted',
      `Your document of type ${document.document_type} has been deleted by the administrator`,
      document.id,
      admin_message
    );

    // Delete file from storage
    const filePath = path.join(__dirname, '..', 'uploads', document.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete document from database
    await document.destroy();

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Error deleting document' });
  }
};

exports.getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(documents);
  } catch (error) {
    console.error('Error getting documents:', error);
    res.status(500).json({ message: 'Error getting documents' });
  }
};

exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json(document);
  } catch (error) {
    console.error('Error getting document:', error);
    res.status(500).json({ message: 'Error getting document' });
  }
};

exports.createDocument = async (req, res) => {
  try {
    const { title, description, fileUrl, type, userId } = req.body;
    
    const document = await Document.create({
      title,
      description,
      fileUrl,
      type,
      userId
    });
    
    res.status(201).json(document);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ message: 'Error creating document' });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const { title, description, fileUrl, type } = req.body;
    const document = await Document.findByPk(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    document.title = title || document.title;
    document.description = description || document.description;
    document.fileUrl = fileUrl || document.fileUrl;
    document.type = type || document.type;
    
    await document.save();
    
    res.json(document);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ message: 'Error updating document' });
  }
};

exports.deleteDocument = deleteDocument;

module.exports = {
  deleteDocument,
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument
}; 