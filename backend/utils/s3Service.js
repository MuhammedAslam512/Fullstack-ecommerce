// ─────────────────────────────────────────────────────────────
// AWS S3 BUCKET SERVICE (AWS SDK v3)
// ─────────────────────────────────────────────────────────────
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const logger = require('../config/logger');

// 1. Initialize S3 Client Instance
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy_key',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy_secret'
  }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'donglify-media-bucket';

/**
 * Generate a temporary Pre-Signed URL for direct client-to-S3 uploads
 * @param {string} fileName - Original file name
 * @param {string} fileType - MIME type (e.g., 'image/jpeg', 'application/pdf')
 */
const generatePresignedUploadUrl = async (fileName, fileType) => {
  try {
    const key = `uploads/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType
    });

    // Generate a signed URL valid for 5 minutes (300 seconds)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    return {
      success: true,
      uploadUrl: signedUrl,
      fileKey: key,
      fileUrl: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`
    };
  } catch (error) {
    logger.error(`Error generating S3 pre-signed URL: ${error.message}`);
    throw error;
  }
};

/**
 * Delete an object from S3 Bucket
 * @param {string} key - S3 object key
 */
const deleteFromS3 = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    await s3Client.send(command);
    logger.info(`🗑️ Deleted S3 Object: ${key}`);
  } catch (error) {
    logger.error(`Error deleting from S3: ${error.message}`);
  }
};

module.exports = {
  s3Client,
  generatePresignedUploadUrl,
  deleteFromS3,
  BUCKET_NAME
};