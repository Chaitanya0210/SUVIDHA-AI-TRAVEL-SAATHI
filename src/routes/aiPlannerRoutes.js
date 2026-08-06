// -----------------------------------------------------------------------------
// AI Planner Routes (src/routes/aiPlannerRoutes.js)
// -----------------------------------------------------------------------------
const express = require('express');
const router = express.Router();
const { planTripWithAi, getRecommendedDestinations } = require('../controllers/aiPlannerController');

router.post('/generate-plan', planTripWithAi);
router.get('/recommendations', getRecommendedDestinations);

module.exports = router;
