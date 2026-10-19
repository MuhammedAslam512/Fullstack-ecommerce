const Document = require('../models/Document');

// @desc    Create a Document inside Workspace
// @route   POST /api/documents
// @access  Private (Workspace Member)
exports.createDocument = async (req, res) => {
  try {
    const { title, content } = req.body;
    const workspaceId = req.headers['x-workspace-id'];

    if (!workspaceId) {
      return res.status(400).json({ message: 'Workspace ID header (x-workspace-id) required.' });
    }

    const document = await Document.create({
      title: title || 'Untitled Document',
      content: content || '',
      workspace: workspaceId,
      createdBy: req.user._id,
      lastUpdatedBy: req.user._id,
    });

    res.status(201).json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create document.', error: error.message });
  }
};

// @desc    Get Document by ID (Tenant Isolated)
// @route   GET /api/documents/:id
// @access  Private (Workspace Member)
exports.getDocumentById = async (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'];
    const document = await Document.findOne({
      _id: req.params.id,
      workspace: workspaceId,
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found in this workspace.' });
    }

    res.status(200).json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch document.', error: error.message });
  }
};