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
      trim: true,
      index: true,
    },
    customDomain: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
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
    subscription: {
      stipeCustomerId: { type: String, default: null },
      stripeSubscriptionId: { type: String, default: null },
      plan: {
        type: String,
        enum: ['FREE', 'PRO', 'ENTERPRISE'],
        default: 'FREE',
      },
      status: {
        type: String,
        enum: ['active', 'past_due', 'canceled', 'incomplete', 'trailing'],
        default: 'active',
      },
      currentPeriodEnd: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Workspace', workspaceSchema);