// ─────────────────────────────────────────
// FILE UPLOAD MIDDLEWARE (Multer)
// ─────────────────────────────────────────
const multer = require('multer');
const path = require('path');

// ── Where to save files ───────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // save to uploads folder
  },
  filename: (req, file, cb) => {
    // Create unique filename
    // Format: fieldname-timestamp.extension
    const uniqueName = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// ── File filter (only images) ─────────────
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images allowed! (jpeg, jpg, png, gif, webp)'), false);
  }
};

// ── Configure multer ──────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

module.exports = upload;