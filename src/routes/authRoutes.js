// -----------------------------------------------------------------------------
// Authentication Routes (src/routes/authRoutes.js)
// -----------------------------------------------------------------------------
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, refreshAccessToken, logoutUser } = require('../controllers/authController');
const { validateRegisterInput, validateLoginInput } = require('../middleware/validate');

router.post('/register', validateRegisterInput, registerUser);
router.post('/login', validateLoginInput, loginUser);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', logoutUser);

module.exports = router;
