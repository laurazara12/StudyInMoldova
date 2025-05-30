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
router.get('/my-applications', applicationAuth, getUserApplications);
router.get('/:id', applicationAuth, applicationOwnership, getApplicationById);
router.put('/:id/update', applicationAuth, applicationOwnership, updateApplication);
router.get('/', applicationAuth, getAllApplications);
router.delete('/:id', applicationAuth, applicationOwnership, deleteApplication);

// Rute pentru admin
router.put('/:id/status', applicationAuth, updateApplicationStatus);
router.put('/:id/cancel', applicationAuth, applicationOwnership, cancelApplication);
router.put('/:id/withdraw', applicationAuth, applicationOwnership, withdrawApplication);

module.exports = router; 