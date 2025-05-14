const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Rute pentru utilizatori
router.post('/', authMiddleware, applicationController.createApplication);
router.get('/my-applications', authMiddleware, applicationController.getUserApplications);
router.get('/:applicationId', authMiddleware, applicationController.getApplicationDetails);

// Rute pentru admin
router.get('/', authMiddleware, adminMiddleware, applicationController.getAllApplications);
router.patch('/:applicationId/status', authMiddleware, adminMiddleware, applicationController.updateApplicationStatus);

module.exports = router; 