// ─────────────────────────────────────────
// AUTH CONTROLLER (With BullMQ Email Queue)
// ─────────────────────────────────────────
const crypto = require('crypto');
const User = require('../models/User');
// ⚡ IMPORT BULLMQ QUEUE HELPERS:
const { addWelcomeEmailJob, addResetPasswordEmailJob } = require('../queues/emailQueue');

// ── Helper: Create token & send response ──
// const sendTokenResponse = (user, statusCode, res, message) => {
//   const token = user.generateToken();

//   res.status(statusCode).json({
//     success: true,
//     message,
//     token,
//     user: {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role
//     }
//   });
// };

// ── Helper: Send Dual Tokens (Access Token in JSON + Refresh Token in HttpOnly Cookie) ──
const sendDualTokenResponse = async (user, statusCode, res, message) => {
  // 1. Generate Tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // 2. Save Refresh Token in Database for Rotation Tracking
  user.refreshTokens = user.refreshTokens || [];
  user.refreshTokens.push({ token: refreshToken });
  await user.save({ validateBeforeSave: false });

  // 3. Configure HttpOnly Cookie Options (XSS Protected!)
  const cookieOptions = {
    httpOnly: true, // Cannot be accessed by JavaScript (XSS Defense)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // CSRF Protection
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Days in milliseconds
  };

  // 4. Send Cookie + JSON Response
  res
    .status(statusCode)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json({
      success: true,
      message,
      accessToken, // Short-lived 15m token
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
};

// ─────────────────────────────────────────────────────────────
// REFRESH TOKEN ROTATION
// POST /api/auth/refresh-token
// ─────────────────────────────────────────────────────────────
const refreshToken = async (req, res) => {

  try {
    // 1. Get Refresh Token from HttpOnly Cookie or Request Body
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token missing. Please log in again.'
      });
    }

    // 2. Verify Refresh Token
    let decoded;
    try {
      decoded = jwt.verify(
        incomingRefreshToken,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh'
      );
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token.'
      });
    }

    // 3. Find User
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    // 4. REUSE DETECTION: Check if token exists in active list
    const tokenExists = user.refreshTokens.some(t => t.token === incomingRefreshToken);

    if (!tokenExists) {
      // ⚠️ SECURITY BREACH DETECTED: Token reuse attempt!
      // Revoke ALL refresh tokens for this user!
      user.refreshTokens = [];
      await user.save({ validateBeforeSave: false });

      res.clearCookie('refreshToken');
      return res.status(403).json({
        success: false,
        message: 'Security breach detected: Reused refresh token. All sessions revoked.'
      });
    }

    // 5. ROTATION: Remove old token from DB
    user.refreshTokens = user.refreshTokens.filter(t => t.token !== incomingRefreshToken);

    // 6. Issue NEW Dual Tokens
    await sendDualTokenResponse(user, 200, res, 'Token refreshed successfully! 🔄');

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// LOGOUT (Clear Cookie & Remove Token from DB)
// POST /api/auth/logout
// ─────────────────────────────────────────────────────────────
const logout = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (incomingRefreshToken && req.user) {
      // Remove token from database
      req.user.refreshTokens = req.user.refreshTokens.filter(t => t.token !== incomingRefreshToken);
      await req.user.save({ validateBeforeSave: false });
    }

    // Clear HttpOnly Cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully! Cookie cleared. 🚪'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
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

    // ⚡ 1. OFFLOAD WELCOME EMAIL TO BULLMQ BACKGROUND QUEUE (Takes 2ms!):
    addWelcomeEmailJob(user);

    // ⚡ 2. SEND INSTANT HTTP RESPONSE BACK TO CLIENT:
    // sendTokenResponse(user, 201, res, 'Registered successfully! 🎉');
    await sendDualTokenResponse(user, 201, res, 'Registered successfully!!')

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

    // sendTokenResponse(user, 200, res, 'Logged in successfully! ✅');
    await sendDualTokenResponse(user, 200, res, 'Logged in successfully')

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
// FORGOT PASSWORD - POST /api/auth/forgot-password
// ─────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email!'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user with this email!'
      });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    // ⚡ OFFLOAD RESET EMAIL TO BULLMQ BACKGROUND QUEUE:
    addResetPasswordEmailJob(user, resetUrl);

    res.status(200).json({
      success: true,
      message: '✅ Password reset link sent to your email!'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ─────────────────────────────────────────
// RESET PASSWORD - POST /api/auth/reset-password
// ─────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password required!'
      });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: '❌ Invalid or expired token!'
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password reset successful! 🎉');

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
// UPLOAD AVATAR - POST /api/auth/upload-avatar
// ─────────────────────────────────────────
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image!'
      });
    }

    const cloudImageUrl = req.file.path;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: req.file.path },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded! to cloud Storage successfully✅',
      data: {
        avatar: user.avatar,
        publicId : req.file.filename
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Export all functions
module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  uploadAvatar,
  refreshToken,
  logout
};