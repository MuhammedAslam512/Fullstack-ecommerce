// ─────────────────────────────────────────────────────────────
// MULTI-TENANT WORKSPACE GUARD MIDDLEWARE
// Enforces tenant isolation across workspaces
// ─────────────────────────────────────────────────────────────
const Workspace = require('../models/Workspace');

const requireWorkspaceMember = async (req, res, next) => {
  try {
    const workspaceId = req.headers['x-workspace-id'] || req.params.workspaceId || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: 'Multi-Tenant Security Error: x-workspace-id header is required!'
      });
    }

    // Find workspace and check membership
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found!'
      });
    }

    // Check if current authenticated user is a member of this workspace
    const memberRecord = workspace.members.find(
      (m) => m.user.toString() === req.user.id
    );

    if (!memberRecord) {
      return res.status(403).json({
        success: false,
        message: '🚫 Access Denied: You are not a member of this Workspace tenant!'
      });
    }

    // Attach workspace and role context to request!
    req.workspace = workspace;
    req.memberRole = memberRecord.role;

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Role-based permission guard within workspace (e.g. Owner or Admin)
const requireWorkspaceRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.memberRole)) {
      return res.status(403).json({
        success: false,
        message: `🚫 Permission Denied: Requires workspace role [${allowedRoles.join(', ')}]`
      });
    }
    next();
  };
};

module.exports = {
  requireWorkspaceMember,
  requireWorkspaceRole
};