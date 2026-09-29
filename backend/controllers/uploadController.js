// ─────────────────────────────────────────────────────────────
// UPLOAD CONTROLLER (PRE-SIGNED S3 URLS)
// ─────────────────────────────────────────────────────────────
const { generatePresignedUploadUrl } = require('../utils/s3Service');
const logger = require('../config/logger');

// @desc    Get Pre-Signed Upload URL for Direct-to-S3 Uploads
// @route   POST /api/uploads/presigned-url
// @access  Private
const getPresignedUrl = async (req, res) => {
  try {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({
        success: false,
        message: 'fileName and fileType are required!'
      });
    }

    // Fallback if AWS keys are not configured
    if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === 'your_aws_access_key_id_here') {
      return res.status(200).json({
        success: true,
        message: 'AWS S3 is in Mock Mode. Set real AWS keys in .env to generate live S3 links.',
        mockData: {
          fileKey: `uploads/mock-${Date.now()}-${fileName}`,
          fileUrl: `https://${process.env.AWS_S3_BUCKET_NAME || 'shopnest-media-bucket'}.s3.amazonaws.com/uploads/mock-${fileName}`
        }
      });
    }

    const result = await generatePresignedUploadUrl(fileName, fileType);

    logger.info(`Generated S3 Pre-Signed URL for user: ${req.user.id}`);

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getPresignedUrl
};