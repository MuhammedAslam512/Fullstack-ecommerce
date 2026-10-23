const AuditLog = require('../models/AuditLog');

/**
 * Asynchronously writes an audit event without blocking the primary HTTP response
 */
exports.logAuditEvent = async ({
  workspaceId,
  user,
  action,
  resource,
  resourceId = null,
  details = {},
  severity = 'INFO',
  req = null,
}) => {
  try {
    if (!workspaceId || !user) return;

    const ipAddress = req
      ? req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1'
      : '127.0.0.1';

    const userAgent = req ? req.headers['user-agent'] || 'Unknown' : 'Unknown';

    await AuditLog.create({
      workspace: workspaceId,
      actor: user._id || user.id,
      actorEmail: user.email || 'system@donglify.com',
      action,
      resource,
      resourceId,
      details,
      severity,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    // Fail silently so logging never breaks primary user actions
    console.error('⚠️ Audit Logging Background Error:', error.message);
  }
};