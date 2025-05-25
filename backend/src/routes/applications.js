const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { 
  createApplication,
  updateApplication,
  getUserApplications,
  getApplicationById,
  cancelApplication
} = require('../controllers/applicationController');

// Rute pentru aplicații
router.post('/', authMiddleware, createApplication);
router.put('/:id', authMiddleware, updateApplication);
router.get('/my-applications', authMiddleware, getUserApplications);
router.get('/', authMiddleware, getUserApplications);
router.get('/:id', authMiddleware, getApplicationById);
router.post('/:id/cancel', authMiddleware, cancelApplication);

module.exports = router; 