const Document = require('../models/Document');
const Workspace = require('../models/Workspace');

// Resource limits per subscription plan
const PLAN_LIMITS = {
    FREE: { maxDocuments: 5, maxMembers: 3 },
    PRO: { maxDocuments: 1000, maxMembers: 25 },
    ENTERPRISE: { maxDocuments: Infinity, maxMembers: 9999 },
};

exports.enforceDocumentLimit = async (req, res, next) => {
    try {
        const workspaceId = req.headers['x-workspace-id'];
        if (!workspaceId) {
            return res.status(400).json({ message: 'Workspace ID header (x-workspace-id) required.' });
        }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found.' });
        }

        const plan = workspace.subscription?.plan || 'FREE';
        const limit = PLAN_LIMITS[plan].maxDocuments;

        // Count existing documents in this workspace
        const currentDocCount = await Document.countDocuments({ workspace: workspaceId });

        if (currentDocCount >= limit) {
            return res.status(403).json({
                error: 'LIMIT_EXCEEDED',
                message: `Plan Document Limit Reached: Your workspace is on the ${plan} plan which allows maximum ${limit} documents. Current count: ${currentDocCount}.`,
                upgradeRequired: true,
            });
        }

        req.workspace = workspace;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Failed to verify resource limits.', error: error.message });
    }
};