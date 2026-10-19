const Workspace = require('../models/Workspace');

const PLAN_LEVELS = {
  FREE: 1,
  PRO: 2,
  ENTERPRISE: 3,
};

exports.requirePlan = (requiredPlan) => {
  return async (req, res, next) => {
    try {
      const workspaceId = req.headers['x-workspace-id'] || req.body.workspaceId || req.params.workspaceId;

      if (!workspaceId) {
        return res.status(400).json({ message: 'Workspace ID header (x-workspace-id) is required.' });
      }

      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found.' });
      }

      const currentPlan = workspace.subscription.plan || 'FREE';
      const isStatusActive = workspace.subscription.status === 'active';

      if (!isStatusActive) {
        return res.status(403).json({ message: 'Subscription is inactive. Please update your billing.' });
      }

      if (PLAN_LEVELS[currentPlan] < PLAN_LEVELS[requiredPlan]) {
        return res.status(403).json({
          message: `Forbidden: This feature requires a ${requiredPlan} plan or higher. Your current plan: ${currentPlan}`,
        });
      }

      req.workspace = workspace;
      next();
    } catch (error) {
      res.status(500).json({ message: 'Subscription verification failed.', error: error.message });
    }
  };
};