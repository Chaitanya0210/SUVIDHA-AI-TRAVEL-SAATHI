// -----------------------------------------------------------------------------
// Subscription Routes (src/routes/subscriptionRoutes.js)
// -----------------------------------------------------------------------------
const express = require('express');
const router = express.Router();
const { upgradeSubscription, getSubscriptionStatus } = require('../controllers/subscriptionController');

router.post('/upgrade', upgradeSubscription);
router.get('/status/:userId', getSubscriptionStatus);

module.exports = router;
