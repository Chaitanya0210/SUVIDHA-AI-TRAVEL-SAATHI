// -----------------------------------------------------------------------------
// Destination Routes (src/routes/destinationRoutes.js)
// -----------------------------------------------------------------------------
const express = require('express');
const router = express.Router();
const { getAllDestinations, getDestinationById, seedDestinations } = require('../controllers/destinationController');

router.get('/seed', seedDestinations);
router.get('/', getAllDestinations);
router.get('/:id', getDestinationById);

module.exports = router;
