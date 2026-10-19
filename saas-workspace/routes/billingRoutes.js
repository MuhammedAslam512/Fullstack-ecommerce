const express = require('express');
const router = express.Router();
const { createCheckoutSession, createCustomerPortal } = require('../controllers/billingController');
const { protect } = require('../middleware/auth');
const { requireWorkspaceRole } = require('../middleware/tenant');

router.post('/checkout', protect, requireWorkspaceRole('Owner'), createCheckoutSession);
router.post('/portal', protect, requireWorkspaceRole('Owner'), createCustomerPortal);

module.exports = router;