const { Document } = require('../models');
const { createNotification, NOTIFICATION_TYPES } = require('./notificationController');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const cloudinary = require('../config/cloudinary');
const { User } = require('../models');
const { Application } = require('../models');

// Definim calea către directorul uploads
const uploadsDir = path.join(__dirname, '../../../uploads');

const deleteDocument = async (req, res) => {
  try {
    const documentId = req.params.id;
    const { admin_message } = req.body;

    // Verificăm dacă documentul există
    const document = await Document.findByPk(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documentul nu a fost găsit'
      });
    }

    // Verificăm permisiunile
    if (req.user.role === 'admin') {
      // Administratorii pot șterge orice document
      console.log('Administrator șterge document:', {
        documentId,
        userId: document.user_id,
        adminId: req.user.id
      });
    } else if (document.user_id === req.user.id) {
      // Utilizatorii pot șterge doar documentele lor
      console.log('Utilizator șterge propriul document:', {
        documentId,
        userId: req.user.id
      });
    } else {
      return res.status(403).json({
        success: false,
        message: 'Nu aveți permisiunea de a șterge acest document'
      });
    }

    // Construiește calea către fișier
    const userDir = path.join(uploadsDir, document.user_id.toString());
    const absolutePath = path.join(userDir, path.basename(document.file_path));

    console.log('Încercare ștergere fișier:', {
      userDir,
      absolutePath,
      exists: fs.existsSync(absolutePath)
    });

    // Șterge fișierul fizic dacă există
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
        console.log('Fișier șters cu succes:', absolutePath);
      } catch (error) {
        console.error('Eroare la ștergerea fișierului:', error);
        // Continuăm cu ștergerea din baza de date chiar dacă ștergerea fișierului a eșuat
      }
    } else {
      console.log('Fișierul nu există la calea:', absolutePath);
    }

    // Șterge documentul din baza de date
    await document.destroy();

    // Creăm notificările în funcție de rolul utilizatorului și statusul documentului
    try {
      if (req.user.role === 'admin') {
        // Dacă adminul șterge documentul, notificăm utilizatorul
        const defaultMessage = `Documentul dumneavoastră de tip ${document.document_type} a fost șters de administrator.`;
        await createNotification(
          document.user_id,
          'document_deleted',
          admin_message || defaultMessage,
          document.id
        );
      } else if (document.status === 'approved') {
        // Dacă utilizatorul șterge un document aprobat, notificăm adminul
        const admins = await User.findAll({ where: { role: 'admin' } });
        for (const admin of admins) {
          await createNotification(
            admin.id,
            'document_deleted',
            `Utilizatorul ${req.user.name} a șters documentul de tip ${document.document_type}.`,
            document.id
          );
        }
      }
    } catch (notificationError) {
      console.error('Eroare la crearea notificării:', notificationError);
      // Continuăm chiar dacă crearea notificării a eșuat
    }

    // Obținem lista actualizată de documente
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
      message: 'Document șters cu succes',
      data: formattedDocuments,
      total: documents.length,
      status: statusCounts
    });
  } catch (error) {
    console.error('Eroare la ștergerea documentului:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la ștergerea documentului',
      error: error.message
    });
  }
};

exports.getAllDocuments = async (req, res) => {
  try {
    console.log('Începe preluarea documentelor pentru admin');
    
    const documents = await Document.findAll({
      where: {
        status: {
          [Op.ne]: 'deleted' // Exclude documentele șterse
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

    console.log(`S-au găsit ${documents.length} documente active`);

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

    console.log('Statistici documente:', statusCounts);

    res.json({
      success: true,
      message: documents.length === 0 ? 'Nu există documente în sistem' : 'Documentele au fost preluate cu succes',
      data: formattedDocuments,
      total: documents.length,
      status: statusCounts
    });
  } catch (error) {
    console.error('Eroare la obținerea documentelor:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea documentelor',
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

    console.log('Începe încărcarea documentului:', {
      originalName: req.file?.originalname,
      document_type,
      user_id,
      tempPath: req.file?.path,
      fileExists: req.file ? fs.existsSync(req.file.path) : false
    });

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nu s-a încărcat niciun fișier',
        data: null
      });
    }

    // Verificăm dacă fișierul temporar există
    if (!fs.existsSync(req.file.path)) {
      console.error('Fișierul temporar nu există la calea:', req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Fișierul temporar nu a fost găsit',
        data: null
      });
    }

    try {
      // Creăm directorul pentru utilizator dacă nu există
      const userDir = path.join(__dirname, '../../../uploads', user_id.toString());
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }

      // Generăm numele fișierului final
      const timestamp = Date.now();
      const uniqueSuffix = Math.round(Math.random() * 1E9);
      const ext = path.extname(req.file.originalname);
      const filename = `${req.file.originalname}-${timestamp}-${uniqueSuffix}${ext}`;
      const finalPath = path.join(userDir, filename);

      // Mutăm fișierul din directorul temporar în directorul final
      fs.copyFileSync(req.file.path, finalPath);
      
      // Ștergem fișierul temporar
      fs.unlinkSync(req.file.path);

      // Creăm documentul în baza de date
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

      console.log('Creare document în baza de date:', documentData);

      const document = await Document.create(documentData);

      // Creăm notificare pentru utilizator
      await createNotification(
        user_id,
        'new_document',
        `Documentul ${document.originalName} a fost încărcat cu succes`,
        document.id,
        null,
        false
      );

      // Creăm notificare pentru administratori
      const admins = await User.findAll({ where: { role: 'admin' } });
      await Promise.all(admins.map(admin => 
        createNotification(
          admin.id,
          'new_document',
          `Un nou document (${document.originalName}) a fost încărcat de utilizatorul ${user_id}`,
          document.id,
          null,
          true
        )
      ));

      console.log('Document creat cu succes:', {
        id: document.id,
        document_type: document.document_type,
        status: document.status
      });

      res.json({
        success: true,
        message: 'Document încărcat cu succes',
        document: {
          id: document.id,
          document_type: document.document_type,
          status: document.status,
          uploaded: document.uploaded,
          uploadDate: document.uploadDate
        }
      });
    } catch (error) {
      // Încercăm să ștergem fișierul temporar în caz de eroare
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
          console.log('Fișier temporar șters după eroare:', req.file.path);
        } catch (unlinkError) {
          console.error('Eroare la ștergerea fișierului temporar:', unlinkError);
        }
      }

      return res.status(400).json({
        success: false,
        message: 'Eroare la încărcarea documentului',
        details: error.message
      });
    }
  } catch (error) {
    console.error('Eroare la încărcarea documentului:', error);

    // Încercăm să ștergem fișierul temporar în caz de eroare
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('Fișier temporar șters după eroare:', req.file.path);
      } catch (unlinkError) {
        console.error('Eroare la ștergerea fișierului temporar:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Eroare la încărcarea documentului',
      error: error.message
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
      const notificationType = status === 'approved' ? NOTIFICATION_TYPES.DOCUMENT_APPROVED : 
                             status === 'rejected' ? NOTIFICATION_TYPES.DOCUMENT_REJECTED : 
                             NOTIFICATION_TYPES.DOCUMENT_UPDATED;
      
      await createNotification(
        document.user_id,
        notificationType,
        `Documentul dumneavoastră de tip ${document.document_type} a fost ${status === 'approved' ? 'aprobat' : 
                                                           status === 'rejected' ? 'respins' : 
                                                           'actualizat'}${req.user.role === 'admin' ? ' de administrator' : ''}`,
        document.id,
        req.body.admin_message || null,
        false
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
    const userId = req.user.id;
    console.log('Începe preluarea documentelor pentru utilizatorul:', userId);
    
    const documents = await Document.findAll({
      where: {
        user_id: userId,
        status: {
          [Op.ne]: 'deleted' // Exclude documentele șterse
        }
      },
      attributes: ['id', 'document_type', 'file_path', 'createdAt', 'status', 'filename', 'originalName', 'uploadDate'],
      order: [['createdAt', 'DESC']]
    });

    console.log(`S-au găsit ${documents.length} documente active pentru utilizatorul ${userId}`);

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

    console.log('Statistici documente utilizator:', statusCounts);

    res.json({
      success: true,
      message: documents.length === 0 ? 'Nu există documente încărcate' : 'Documentele au fost preluate cu succes',
      data: formattedDocuments,
      total: documents.length,
      status: statusCounts
    });
  } catch (error) {
    console.error('Eroare la obținerea documentelor utilizatorului:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea documentelor',
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
    
    // Verificăm dacă documentul există
    const document = await Document.findByPk(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documentul nu a fost găsit'
      });
    }

    // Verificăm dacă documentul este asociat cu vreo aplicație
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
      message: application ? 'Documentul este asociat cu o aplicație' : 'Documentul nu are dependențe'
    });
  } catch (error) {
    console.error('Eroare la verificarea dependențelor documentului:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la verificarea dependențelor documentului',
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