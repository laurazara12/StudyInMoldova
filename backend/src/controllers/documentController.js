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
      `Documentul tău de tip ${document.document_type} a fost șters de către administrator`,
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

module.exports = {
  deleteDocument
}; 