// -----------------------------------------------------------------------------
// Interaction Routes (src/routes/interactionRoutes.js)
// -----------------------------------------------------------------------------
const express = require('express');
const router = express.Router();
const { recordInteraction, getUserInteractionHistory } = require('../controllers/interactionController');

router.post('/', recordInteraction);
router.get('/history/:userId', getUserInteractionHistory);

module.exports = router;
