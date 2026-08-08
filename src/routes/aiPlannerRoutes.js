// -----------------------------------------------------------------------------
// AI Planner Routes (src/routes/aiPlannerRoutes.js)
// -----------------------------------------------------------------------------
const express = require('express');
const router = express.Router();
const { planTripWithAi, getRecommendedDestinations } = require('../controllers/aiPlannerController');
const { validateAiPlannerInput } = require('../middleware/validate');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/generate-plan', aiLimiter, validateAiPlannerInput, planTripWithAi);
router.get('/recommendations', getRecommendedDestinations);

module.exports = router;
