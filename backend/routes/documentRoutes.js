const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/auth');

// Rute pentru utilizatori
router.post('/', protect, documentController.uploadDocument);
router.get('/my-documents', protect, documentController.getUserDocuments);

// Rute pentru admin
router.get('/', protect, authorize('admin'), documentController.getAllDocuments);
router.delete('/:documentId', protect, authorize('admin'), documentController.deleteDocument);

module.exports = router; 