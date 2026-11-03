const express = require('express');
const router = express.Router();
const { createCheckoutSession, createCustomerPortal } = require('../controllers/billingController');
const { protect } = require('../middleware/auth');
const { requireWorkspaceMember, requireWorkspaceRole } = require('../middleware/tenant');

// 1. Authenticate JWT token
router.use(protect);

// 2. Attach Workspace Context & User Role (req.workspaceRole)
router.use(requireWorkspaceMember);

// 3. Enforce Owner Role for Billing Actions
router.post('/checkout', requireWorkspaceRole('Owner'), createCheckoutSession);
router.post('/portal', requireWorkspaceRole('Owner'), createCustomerPortal);

module.exports = router;