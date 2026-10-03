const express = require('express');
require('../config/passport')
const passport = require('passport');
const router = express.Router();

const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  uploadAvatar,
  refreshToken,
  logout,
  getCsrfToken,
  revokeGoogleAuth
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadAvatarCloud } = require('../middleware/cloudUpload');
const customRateLimiter = require('../middleware/rateLimiter');

const strictAuthLimiter = customRateLimiter({
  windowSizeInSeconds: 300, // 5 Minutes
  maxRequests: 5,
  keyPrefix: 'auth_strict'
});

// Public routes
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@gmail.com
 *               password:
 *                 type: string
 *                 example: john1234
 *     responses:
 *       201:
 *         description: User created successfully & JWT issued
 *       400:
 *         description: Validation error or Email already exists
 */
router.post('/register', strictAuthLimiter, register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user & get JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@gmail.com
 *               password:
 *                 type: string
 *                 example: john1234
 *     responses:
 *       200:
 *         description: Logged in successfully
 *       401:
 *         description: Invalid email or password
 */
router.post('/login', strictAuthLimiter, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/csrf-token', getCsrfToken)

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  async (req, res) => {
    // Generate JWT Access Token for Google user
    const accessToken = req.user.generateAccessToken();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    
    // Redirect to React Frontend with token!
    res.redirect(`${clientUrl}/login?token=${accessToken}`);
  }
);


// Protected routes
/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user session
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *       401:
 *         description: Unauthorized token
*/
router.get('/me', protect, getMe);
router.put('/updatepassword', protect, updatePassword);
// router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);
router.post(
  '/upload-avatar',
  protect,
  uploadAvatarCloud.single('avatar'),
  uploadAvatar
);
router.post('/revoke-google', protect, revokeGoogleAuth)

module.exports = router;