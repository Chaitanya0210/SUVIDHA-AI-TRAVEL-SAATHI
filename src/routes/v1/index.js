// -----------------------------------------------------------------------------
// Version 1 Root Router (src/routes/v1/index.js)
// -----------------------------------------------------------------------------
const express = require('express');
const router = express.Router();

// Import Individual Routers
const destinationRoutes = require('../destinationRoutes');
const aiPlannerRoutes = require('../aiPlannerRoutes');
const authRoutes = require('../authRoutes');
const subscriptionRoutes = require('../subscriptionRoutes');
const recommendationRoutes = require('../recommendationRoutes');
const interactionRoutes = require('../interactionRoutes');

// Mount Modules under API version 1 prefix
router.use('/destinations', destinationRoutes);
router.use('/ai-planner', aiPlannerRoutes);
router.use('/auth', authRoutes);
router.use('/subscription', subscriptionRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/interactions', interactionRoutes);

module.exports = router;
