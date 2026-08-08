// -----------------------------------------------------------------------------
// Destination Routes (src/routes/destinationRoutes.js)
// -----------------------------------------------------------------------------
const express = require('express');
const router = express.Router();
const { getAllDestinations, getDestinationById, seedDestinations } = require('../controllers/destinationController');
const { validateDestinationsQuery } = require('../middleware/validate');

router.get('/seed', seedDestinations);
router.get('/', validateDestinationsQuery, getAllDestinations);
router.get('/:id', getDestinationById);

module.exports = router;
