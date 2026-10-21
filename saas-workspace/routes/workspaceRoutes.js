const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireWorkspaceMember, requireWorkspaceRole } = require('../middleware/tenant');
const { requirePlan } = require('../middleware/subscription')
const { createWorkspace, getMyWorkspaces, inviteMember, bindCustomDomain } = require('../controllers/workspaceController');

router.post('/', protect, createWorkspace);
router.get('/my', protect, getMyWorkspaces);
router.post(
  '/invite',
  protect,
  requireWorkspaceMember,
  requireWorkspaceRole('Owner', 'Admin'),
  inviteMember
);

router.post('/custom-domain', requireWorkspaceRole('Owner'), requirePlan('ENTERPRISE'), bindCustomDomain);
module.exports = router;

