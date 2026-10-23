const AuditLog = require('../models/AuditLog');

// @desc    Get Workspace Security Activity Feed / Audit Logs
// @route   GET /api/audit-logs
// @access  Private (Workspace Admin/Owner)
exports.getWorkspaceAuditLogs = async (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'] || req.workspaceId;
    const { severity, action, limit = 20, page = 1 } = req.query;

    const query = { workspace: workspaceId };

    if (severity) query.severity = severity.toUpperCase();
    if (action) query.action = action.toUpperCase();

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('actor', 'name email');

    const totalLogs = await AuditLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        totalEvents: totalLogs,
        page: parseInt(page),
        totalPages: Math.ceil(totalLogs / parseInt(limit)),
        logs,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve audit logs.', error: error.message });
  }
};