// -----------------------------------------------------------------------------
// Subscription Routes (src/routes/subscriptionRoutes.js)
// -----------------------------------------------------------------------------
const express = require('express');
const router = express.Router();
const { upgradeSubscription, getSubscriptionStatus } = require('../controllers/subscriptionController');
const { validateSubscriptionUpgrade } = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');

router.post('/upgrade', validateSubscriptionUpgrade, upgradeSubscription);
router.get('/status/:userId', getSubscriptionStatus);

module.exports = router;
