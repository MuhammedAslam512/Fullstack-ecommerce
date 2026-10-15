const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireWorkspaceMember, requireWorkspaceRole } = require('../middleware/tenant');
const { createWorkspace, getMyWorkspaces, inviteMember } = require('../controllers/workspaceController');

router.post('/', protect, createWorkspace);
router.get('/my', protect, getMyWorkspaces);
router.post(
  '/invite',
  protect,
  requireWorkspaceMember,
  requireWorkspaceRole('Owner', 'Admin'),
  inviteMember
);

module.exports = router;