const express = require('express');
const router = express.Router();
const { getWorkspaceAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { requireWorkspaceMember } = require('../middleware/tenant');

router.get('/usage', protect, requireWorkspaceMember, getWorkspaceAnalytics);

module.exports = router