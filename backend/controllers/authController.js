// ─────────────────────────────────────────
// AUTH CONTROLLER
// ─────────────────────────────────────────
const User = require('../models/User');

// ── Helper: Create token & send response ──
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = user.generateToken();

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

// ─────────────────────────────────────────
// REGISTER - POST /api/auth/register
// ─────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password!'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered!'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role
    });

    sendTokenResponse(user, 201, res, 'Registered successfully! 🎉');

  } catch (error) {
    console.error('Register Error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors)
        .map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ─────────────────────────────────────────
// LOGIN - POST /api/auth/login
// ─────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password!'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '❌ Invalid email or password!'
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '❌ Invalid email or password!'
      });
    }

    sendTokenResponse(user, 200, res, 'Logged in successfully! ✅');

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ─────────────────────────────────────────
// GET ME - GET /api/auth/me
// ─────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ─────────────────────────────────────────
// UPDATE PASSWORD - PUT /api/auth/updatepassword
// ─────────────────────────────────────────
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password!'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '❌ Current password is incorrect!'
      });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password updated! ✅');

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ─────────────────────────────────────────
// UPLOAD AVATAR
// POST /api/auth/upload-avatar
// Protected + File upload
// ─────────────────────────────────────────
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image!'
      });
    }

    // Update user's avatar path
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: req.file.path },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded! ✅',
      data: {
        avatar: user.avatar,
        filename: req.file.filename,
        size: req.file.size
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update exports:
module.exports = {
  register,
  login,
  getMe,
  updatePassword,
  uploadAvatar  // ← add this
};
