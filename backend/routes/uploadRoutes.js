const express = require('express');
const router = express.Router();
const { getPresignedUrl } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

// Request Pre-Signed URL (Logged in users only)
router.post('/presigned-url', protect, getPresignedUrl);

module.exports = router;