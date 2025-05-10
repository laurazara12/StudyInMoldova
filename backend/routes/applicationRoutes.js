const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

// Rute pentru utilizatori
router.post('/', protect, applicationController.createApplication);
router.get('/my-applications', protect, applicationController.getUserApplications);
router.get('/:applicationId', protect, applicationController.getApplicationDetails);

// Rute pentru admin
router.get('/', protect, authorize('admin'), applicationController.getAllApplications);
router.patch('/:applicationId/status', protect, authorize('admin'), applicationController.updateApplicationStatus);

module.exports = router; 