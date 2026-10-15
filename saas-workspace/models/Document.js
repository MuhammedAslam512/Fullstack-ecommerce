const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Document title required'],
      trim: true
    },
    content: {
      type: String,
      default: ''
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true // Index for fast multi-tenant queries!
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

// Multi-tenant Compound Index for fast document lookups within a tenant workspace
documentSchema.index({ workspace: 1, createdAt: -1 });

module.exports = mongoose.model('Document', documentSchema);