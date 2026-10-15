const Workspace = require('../models/Workspace');

// ── 1. CREATE WORKSPACE (User becomes Owner) ──
exports.createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Workspace name required' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString().slice(-4);

    const workspace = await Workspace.create({
      name,
      slug,
      owner: req.user.id,
      members: [
        {
          user: req.user.id,
          role: 'Owner'
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: '🎉 Workspace created successfully!',
      data: workspace
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── 2. GET MY WORKSPACES ──
exports.getMyWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      'members.user': req.user.id
    }).populate('members.user', 'name email');

    res.json({
      success: true,
      count: workspaces.length,
      data: workspaces
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── 3. INVITE MEMBER TO WORKSPACE (Admin/Owner Only) ──
exports.inviteMember = async (req, res) => {
  try {
    const { userId, role = 'Member' } = req.body;

    const workspace = req.workspace; // Attached by requireWorkspaceMember middleware!

    // Check if user already in workspace
    const exists = workspace.members.some((m) => m.user.toString() === userId);
    if (exists) {
      return res.status(400).json({ success: false, message: 'User is already a member of this workspace' });
    }

    workspace.members.push({ user: userId, role });
    await workspace.save();

    res.json({
      success: true,
      message: 'Member invited to workspace!',
      data: workspace
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};