const express = require('express');
const router = express.Router();
const { getWorkspaceAuditLogs } = require('../controllers/auditController');
const { protect } = require('../middleware/auth');
const { requireWorkspaceMember, requireWorkspaceRole } = require('../middleware/tenant');

router.use(protect);
router.use(requireWorkspaceMember);

// Only Workspace Admin or Owner can view the Security Audit Activity Feed
router.get('/', requireWorkspaceRole('Admin'), getWorkspaceAuditLogs);

module.exports = router;