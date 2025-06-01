const { Document, Application } = require('../models');
const { createNotification, NOTIFICATION_TYPES } = require('./notificationController');
const fs = require('fs').promises;
const path = require('path');
const { Op } = require('sequelize');
const cloudinary = require('../config/cloudinary');
const { User } = require('../models');

// Define the path to the uploads directory
const uploadsDir = path.join(__dirname, '../../../uploads');

const deleteDocument = async (req, res) => {
  try {
    const documentId = req.params.id;
    const { admin_message } = req.body;

    // Check if the document exists
    const document = await Document.findByPk(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check permissions
    if (req.user.role === 'admin') {
      // Administrators can delete any document
      console.log('Administrator deleting document:', {
        documentId,
        userId: document.user_id,
        adminId: req.user.id
      });
    } else if (document.user_id === req.user.id) {
      // Users can only delete their own documents
      console.log('User deleting own document:', {
        documentId,
        userId: req.user.id
      });
    } else {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this document'
      });
    }

    // Build the file path
    const userDir = path.join(uploadsDir, document.user_id.toString());
    const absolutePath = path.join(userDir, path.basename(document.file_path));

    console.log('Attempting to delete file:', {
      userDir,
      absolutePath,
      exists: await fs.access(absolutePath).then(() => true).catch(() => false)
    });

    // Delete the physical file if it exists
    if (await fs.access(absolutePath).then(() => true).catch(() => false)) {
      try {
        await fs.unlink(absolutePath);
        console.log('File successfully deleted:', absolutePath);
      } catch (error) {
        console.error('Error deleting file:', error);
        // Continue with database deletion even if file deletion fails
      }
    } else {
      console.log('File does not exist at path:', absolutePath);
    }

    // Delete the document from the database
    await document.destroy();

    // Create notifications based on user role and document status
    try {
      if (req.user.role === 'admin') {
        // If admin deletes the document, notify the user
        const defaultMessage = `Your ${document.document_type} document has been deleted by the administrator.`;
        await createNotification(
          document.user_id,
          'document_deleted',
          admin_message || defaultMessage,
          document.id
        );
      } else if (document.status === 'approved') {
        // If user deletes an approved document, notify admins
        const admins = await User.findAll({ where: { role: 'admin' } });
        for (const admin of admins) {
          await createNotification(
            admin.id,
            'document_deleted',
            `User ${req.user.name} has deleted the ${document.document_type} document.`,
            document.id
          );
        }
      }
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Continue even if notification creation fails
    }

    // Get the updated list of documents
    const documents = await Document.findAll({
      where: {
        status: {
          [Op.ne]: 'deleted'
        }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Application,
          as: 'applications',
          attributes: ['id', 'status']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const formattedDocuments = documents.map(doc => ({
      id: doc.id,
      document_type: doc.document_type,
      file_path: doc.file_path,
      createdAt: doc.createdAt,
      status: doc.status || 'pending',
      filename: doc.filename,
      originalName: doc.originalName,
      user: doc.user ? {
        id: doc.user.id,
        name: doc.user.name,
        email: doc.user.email
      } : null,
      applications: doc.applications ? doc.applications.map(app => ({
        id: app.id,
        status: app.status
      })) : []
    }));

    const statusCounts = {
      pending: documents.filter(doc => doc.status === 'pending').length,
      approved: documents.filter(doc => doc.status === 'approved').length,
      rejected: documents.filter(doc => doc.status === 'rejected').length
    };

    res.json({
      success: true,
      message: 'Document successfully deleted',
      data: formattedDocuments,
      total: documents.length,
      status: statusCounts
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting document',
      error: error.message
    });
  }
};

exports.getAllDocuments = async (req, res) => {
  try {
    console.log('Starting document retrieval for admin');
    
    const documents = await Document.findAll({
      where: {
        status: {
          [Op.ne]: 'deleted' // Exclude deleted documents
        }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Application,
          as: 'applications',
          attributes: ['id', 'status']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`Found ${documents.length} active documents`);

    const formattedDocuments = documents.map(doc => ({
      id: doc.id,
      document_type: doc.document_type,
      file_path: doc.file_path,
      createdAt: doc.createdAt,
      status: doc.status || 'pending',
      filename: doc.filename,
      originalName: doc.originalName,
      user: doc.user ? {
        id: doc.user.id,
        name: doc.user.name,
        email: doc.user.email
      } : null,
      applications: doc.applications ? doc.applications.map(app => ({
        id: app.id,
        status: app.status
      })) : []
    }));

    const statusCounts = {
      pending: documents.filter(doc => doc.status === 'pending').length,
      approved: documents.filter(doc => doc.status === 'approved').length,
      rejected: documents.filter(doc => doc.status === 'rejected').length
    };

    console.log('Document statistics:', statusCounts);

    res.json({
      success: true,
      message: documents.length === 0 ? 'No documents in system' : 'Documents retrieved successfully',
      data: formattedDocuments,
      total: documents.length,
      status: statusCounts
    });
  } catch (error) {
    console.error('Error retrieving documents:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving documents',
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
    console.log('Searching for document with ID:', req.params.id);
    
    const document = await Document.findOne({
      where: {
        id: req.params.id,
        status: {
          [Op.not]: 'deleted'
        }
      },
      attributes: ['id', 'document_type', 'file_path', 'createdAt', 'status', 'filename', 'originalName']
    });

    console.log('Document found:', document ? {
      id: document.id,
      status: document.status,
      document_type: document.document_type
    } : 'Not found');

    if (!document) {
      return res.status(404).json({ 
        success: false,
        message: 'Document not found',
        data: null
      });
    }

    // Format the document to ensure it has all required properties
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
      message: 'Document retrieved successfully',
      data: formattedDocument
    });
  } catch (error) {
    console.error('Error retrieving document:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error retrieving document',
      error: error.message,
      data: null
    });
  }
};

exports.createDocument = async (req, res) => {
  try {
    const { document_type } = req.body;
    const user_id = req.user.id;

    console.log('Starting document upload:', {
      originalName: req.file?.originalname,
      document_type,
      user_id,
      tempPath: req.file?.path,
      fileExists: req.file ? await fs.access(req.file.path).then(() => true).catch(() => false) : false
    });

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
        data: null
      });
    }

    // Check if temporary file exists
    if (!(await fs.access(req.file.path).then(() => true).catch(() => false))) {
      console.error('Temporary file does not exist at path:', req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Temporary file not found',
        data: null
      });
    }

    try {
      // Create user directory if it doesn't exist
      const userDir = path.join(__dirname, '../../../uploads', user_id.toString());
      if (!(await fs.access(userDir).then(() => true).catch(() => false))) {
        await fs.mkdir(userDir, { recursive: true });
      }

      // Generate final filename
      const timestamp = Date.now();
      const uniqueSuffix = Math.round(Math.random() * 1E9);
      const ext = path.extname(req.file.originalname);
      const filename = `${req.file.originalname}-${timestamp}-${uniqueSuffix}${ext}`;
      const finalPath = path.join(userDir, filename);

      // Move file from temporary directory to final directory
      await fs.copyFile(req.file.path, finalPath);
      
      // Delete temporary file
      await fs.unlink(req.file.path);

      // Create document in database
      const documentData = {
        user_id,
        document_type,
        file_path: finalPath,
        filename: filename,
        originalName: req.file.originalname,
        status: 'pending',
        uploaded: true,
        uploadDate: new Date()
      };

      console.log('Creating document in database:', documentData);

      const document = await Document.create(documentData);

      // Create notification for user
      await createNotification(
        user_id,
        'new_document',
        `Document ${document.originalName} has been successfully uploaded`,
        document.id,
        null,
        false
      );

      // Create notification for administrators
      const admins = await User.findAll({ where: { role: 'admin' } });
      await Promise.all(admins.map(admin => 
        createNotification(
          admin.id,
          'new_document',
          `A new document (${document.originalName}) has been uploaded by user ${user_id}`,
          document.id,
          null,
          true
        )
      ));

      console.log('Document created successfully:', {
        id: document.id,
        document_type: document.document_type,
        status: document.status
      });

      res.json({
        success: true,
        message: 'Document uploaded successfully',
        document: {
          id: document.id,
          document_type: document.document_type,
          status: document.status,
          uploaded: document.uploaded,
          uploadDate: document.uploadDate
        }
      });
    } catch (error) {
      // Try to delete temporary file in case of error
      if (req.file && await fs.access(req.file.path).then(() => true).catch(() => false)) {
        try {
          await fs.unlink(req.file.path);
          console.log('Temporary file deleted after error:', req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting temporary file:', unlinkError);
        }
      }

      return res.status(400).json({
        success: false,
        message: 'Error uploading document',
        details: error.message
      });
    }
  } catch (error) {
    console.error('Error uploading document:', error);

    // Try to delete temporary file in case of error
    if (req.file && await fs.access(req.file.path).then(() => true).catch(() => false)) {
      try {
        await fs.unlink(req.file.path);
        console.log('Temporary file deleted after error:', req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting temporary file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: error.message
    });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const { status, document_type, file_path, filename, originalName } = req.body;
    console.log('Document ID searched:', req.params.id);
    console.log('Received data:', req.body);
    
    const document = await Document.findOne({
      where: {
        id: req.params.id,
        status: {
          [Op.not]: 'deleted'
        }
      }
    });

    console.log('Document found:', {
      id: document?.id,
      originalName: document?.originalName,
      filename: document?.filename,
      status: document?.status
    });

    if (!document) {
      return res.status(404).json({ 
        success: false,
        message: 'Document not found',
        data: null
      });
    }

    // Check if status is valid
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Valid statuses are: pending, approved, rejected',
        data: null
      });
    }

    // Update document
    const updateData = {};
    if (status) updateData.status = status;
    if (document_type) updateData.document_type = document_type;
    if (file_path) updateData.file_path = file_path;
    if (filename) updateData.filename = filename;
    if (originalName) updateData.originalName = originalName;

    await document.update(updateData);

    // Create notification for user
    if (status) {
      const notificationType = status === 'approved' ? NOTIFICATION_TYPES.DOCUMENT_APPROVED : 
                             status === 'rejected' ? NOTIFICATION_TYPES.DOCUMENT_REJECTED : 
                             NOTIFICATION_TYPES.DOCUMENT_UPDATED;
      
      await createNotification(
        document.user_id,
        notificationType,
        `Your ${document.document_type} document has been ${status === 'approved' ? 'approved' : 
                                                           status === 'rejected' ? 'rejected' : 
                                                           'updated'}${req.user.role === 'admin' ? ' by administrator' : ''}`,
        document.id,
        req.body.admin_message || null,
        false
      );
    }

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: document
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating document',
      error: error.message,
      data: null
    });
  }
};

exports.deleteDocument = deleteDocument;

exports.getUserDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Starting document retrieval for user:', userId);
    
    const documents = await Document.findAll({
      where: {
        user_id: userId,
        status: {
          [Op.ne]: 'deleted' // Exclude deleted documents
        }
      },
      attributes: ['id', 'document_type', 'file_path', 'createdAt', 'status', 'filename', 'originalName', 'uploadDate'],
      order: [['createdAt', 'DESC']]
    });

    console.log(`Found ${documents.length} active documents for user ${userId}`);

    const formattedDocuments = documents.map(doc => ({
      id: doc.id,
      document_type: doc.document_type,
      file_path: doc.file_path,
      createdAt: doc.createdAt,
      uploadDate: doc.uploadDate || doc.createdAt,
      status: doc.status || 'pending',
      filename: doc.filename,
      originalName: doc.originalName,
      uploaded: true
    }));

    const statusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0
    };

    documents.forEach(doc => {
      const status = doc.status || 'pending';
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      }
    });

    console.log('User document statistics:', statusCounts);

    res.json({
      success: true,
      message: documents.length === 0 ? 'No documents uploaded' : 'Documents retrieved successfully',
      data: formattedDocuments,
      total: documents.length,
      status: statusCounts
    });
  } catch (error) {
    console.error('Error retrieving user documents:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving documents',
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

exports.checkDocumentDependencies = async (req, res) => {
  try {
    const documentId = req.params.id;
    
    // Check if document exists
    const document = await Document.findByPk(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if document is associated with any application
    const application = await Application.findOne({
      include: [{
        model: Document,
        as: 'documents',
        where: { id: documentId }
      }]
    });

    res.json({
      success: true,
      hasDependencies: !!application,
      message: application ? 'Document is associated with an application' : 'Document has no dependencies'
    });
  } catch (error) {
    console.error('Error checking document dependencies:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking document dependencies',
      error: error.message
    });
  }
};

module.exports = {
  deleteDocument: exports.deleteDocument,
  getDocumentById: exports.getDocumentById,
  createDocument: exports.createDocument,
  updateDocument: exports.updateDocument,
  getUserDocuments: exports.getUserDocuments,
  getAllDocuments: exports.getAllDocuments,
  checkDocumentDependencies: exports.checkDocumentDependencies
}; 