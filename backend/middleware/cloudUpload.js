// CLOUD OBJECT STORAGE MIDDLEWARE (CLOUDINARY + MULTER)
// 
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// 1. Configure Cloudinary Credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Configure Cloudinary Storage Engine
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shopnest/avatars', // Cloud Folder Name
    format: async (req, file) => 'webp', // Auto-convert to WebP for speed!
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' } // Auto-crop around face!
    ]
  }
});

const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shopnest/products',
    format: async (req, file) => 'webp',
    transformation: [
      { width: 1000, height: 1000, crop: 'limit' } // Max 1000x1000 resolution
    ]
  }
});

// 3. File Filter (Images Only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WEBP) are allowed!'), false);
  }
};

// Multer Upload Instances
const uploadAvatarCloud = multer({
  storage: avatarStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB Max
});

const uploadProductCloud = multer({
  storage: productStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB Max
});

// 4. Helper Function: Delete Image from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
      console.log(`🗑️ Cloudinary Image Deleted: ${publicId}`);
    }
  } catch (err) {
    console.error('Cloudinary deletion error:', err.message);
  }
};

module.exports = {
  uploadAvatarCloud,
  uploadProductCloud,
  deleteFromCloudinary,
  cloudinary
};