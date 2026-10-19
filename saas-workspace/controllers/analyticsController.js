const mongoose = require('mongoose');
const Document = require('../models/Document');
const Workspace = require('../models/Workspace');

// @desc    Get Usage Analytics for Workspace
// @route   GET /api/analytics/usage
// @access  Private (Workspace Member)
exports.getWorkspaceAnalytics = async (req, res) => {
    try {
        const workspaceId = req.headers['x-workspace-id'];

        if (!workspaceId) {
            return res.status(400).json({ message: 'Workspace ID header (x-workspace-id) required.' });
        }

        const workspaceObjectId = new mongoose.Types.ObjectId(workspaceId);

        // Run Aggregation Pipeline
        const stats = await Document.aggregate([
            { $match: { workspace: workspaceObjectId } },
            {
                $facet: {
                    totalDocuments: [{ $count: 'count' }],
                    totalCharactersWritten: [
                        { $project: { contentLength: { $strLenCP: { $ifNull: ['$content', ''] } } } },
                        { $group: { _id: null, totalChars: { $sum: '$contentLength' } } },
                    ],
                    recentlyUpdated: [
                        { $sort: { updatedAt: -1 } },
                        { $limit: 5 },
                        { $project: { title: 1, updatedAt: 1 } },
                    ],
                },
            },
        ]);

        const workspace = await Workspace.findById(workspaceId).select('name subscription members');

        const totalDocs = stats[0]?.totalDocuments[0]?.count || 0;
        const totalChars = stats[0]?.totalCharactersWritten[0]?.totalChars || 0;
        const recentDocs = stats[0]?.recentlyUpdated || [];

        const plan = workspace.subscription?.plan || 'FREE';
        const docLimit = plan === 'FREE' ? 5 : plan === 'PRO' ? 1000 : 'Unlimited';

        res.status(200).json({
            success: true,
            data: {
                workspaceName: workspace.name,
                plan,
                memberCount: workspace.members.length,
                usage: {
                    documentsCount: totalDocs,
                    documentLimit: docLimit,
                    usagePercentage: typeof docLimit === 'number' ? Math.round((totalDocs / docLimit) * 100) : 0,
                    totalCharactersWritten: totalChars,
                },
                recentlyUpdatedDocuments: recentDocs,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to compute workspace analytics.', error: error.message });
    }
};