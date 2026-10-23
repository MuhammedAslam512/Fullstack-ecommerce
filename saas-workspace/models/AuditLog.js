const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actorEmail: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'WORKSPACE_CREATED',
        'MEMBER_INVITED',
        'MEMBER_ROLE_UPDATED',
        'MEMBER_REMOVED',
        'DOCUMENT_CREATED',
        'DOCUMENT_DELETED',
        'SUBSCRIPTION_UPGRADED',
        'CUSTOM_DOMAIN_BOUND',
        'CROSS_TENANT_ACCESS_DENIED',
      ],
    },
    resource: {
      type: String,
      required: true, // e.g. "Workspace", "Document", "Subscription"
    },
    resourceId: {
      type: String,
      default: null,
    },
    details: {
      type: mongoose.Schema.Types.Mixed, // Stores arbitrary event JSON metadata
      default: {},
    },
    severity: {
      type: String,
      enum: ['INFO', 'WARNING', 'CRITICAL'],
      default: 'INFO',
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
      default: 'Unknown',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Immutable: createdAt only
  }
);

// Compound index for fast timeline queries per workspace
auditLogSchema.index({ workspace: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);