const express = require('express');
const router = express.Router();
const {
  getAllRegistrations,
  exportToExcel,
  createManualRegistration,
  getStatistics
} = require('../controllers/adminController');

// GET /api/admin/registrations - Get all registrations
router.get('/registrations', getAllRegistrations);

// GET /api/admin/export - Export to Excel
router.get('/export', exportToExcel);

// POST /api/admin/manual-registration - Create manual registration
router.post('/manual-registration', createManualRegistration);

// GET /api/admin/statistics - Get registration statistics
router.get('/statistics', getStatistics);

module.exports = router;