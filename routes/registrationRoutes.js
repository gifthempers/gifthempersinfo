const express = require('express');
const router = express.Router();
const {
  createRegistration,
  validateRegistration,
  verifyRegistration
} = require('../controllers/registrationController');

// POST /api/registration/create - Create new registration
router.post('/create', createRegistration);

// POST /api/registration/validate - Validate registration by KEN
router.post('/validate', validateRegistration);

// POST /api/registration/verify - Verify registration
router.post('/verify', verifyRegistration);

module.exports = router;