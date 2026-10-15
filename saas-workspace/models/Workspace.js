const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name required'],
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        role: {
          type: String,
          enum: ['Owner', 'Admin', 'Member', 'Guest'],
          default: 'Member'
        },
        joinedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    plan: {
      type: String,
      enum: ['Free', 'Pro', 'Enterprise'],
      default: 'Free'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Workspace', workspaceSchema);