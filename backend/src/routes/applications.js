const express = require('express');
const router = express.Router();
const { applicationAuth, applicationOwnership } = require('../middleware/auth');
const {
  createApplication,
  getUserApplications,
  getApplicationById,
  updateApplication,
  cancelApplication,
  withdrawApplication,
  getAllApplications,
  updateApplicationStatus,
  deleteApplication
} = require('../controllers/applicationController');

// Rute pentru utilizatori
router.post('/', applicationAuth, createApplication);
router.get('/user', applicationAuth, getUserApplications);
router.get('/:id', applicationAuth, applicationOwnership, getApplicationById);
router.patch('/:id', applicationAuth, applicationOwnership, updateApplication);
router.patch('/:id/cancel', applicationAuth, applicationOwnership, cancelApplication);
router.patch('/:id/withdraw', applicationAuth, applicationOwnership, withdrawApplication);
router.delete('/:id', applicationAuth, applicationOwnership, deleteApplication);

// Rute pentru administratori
router.get('/', applicationAuth, getAllApplications);
router.patch('/:id/status', applicationAuth, updateApplicationStatus);

module.exports = router; 