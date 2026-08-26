// ─────────────────────────────────────────
// AUTH MIDDLEWARE
// Protects routes - checks if user is logged in
// ─────────────────────────────────────────
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Protect Route (must be logged in) ────
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    // Format: "Bearer eyJhbGci..."
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
      //                                         ↑
      //                          ["Bearer", "token"] → [1] = token
    }

    // No token found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '❌ Not authorized! Please login first.'
      });
    }

    // Verify token is valid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id: "64abc123", iat: ..., exp: ... }

    // Find user from token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '❌ User no longer exists!'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: '❌ Your account has been deactivated!'
      });
    }

    // Add user to request object
    // Now any route can access req.user!
    req.user = user;

    next(); // ← Move to the actual route

  } catch (error) {
    // Token expired or invalid
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '❌ Invalid token!'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '❌ Token expired! Please login again.'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ── Authorize Roles (admin only etc) ─────
const authorize = (...roles) => {
  // roles = ['admin'] or ['admin', 'moderator']
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `❌ Role '${req.user.role}' is not allowed!`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };