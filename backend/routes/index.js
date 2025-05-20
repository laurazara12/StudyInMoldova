const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const programRoutes = require('./programRoutes');
const documentRoutes = require('./documentRoutes');
const applicationRoutes = require('./applicationRoutes');
const savedProgramRoutes = require('./savedProgramRoutes');
const helpYouChooseRoutes = require('./helpYouChooseRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/programs', programRoutes);
router.use('/documents', documentRoutes);
router.use('/applications', applicationRoutes);
router.use('/saved-programs', savedProgramRoutes);
router.use('/help-you-choose', helpYouChooseRoutes);

module.exports = router; 