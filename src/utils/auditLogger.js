const AuditLog = require('../models/AuditLog');

const auditLogger = async (userId, action, entityType, entityId, details, ipAddress) => {
  try {
    const log = new AuditLog({
      userId,
      action,
      entityType,
      entityId,
      details,
      ipAddress
    });
    await log.save();
  } catch (err) {
    console.error('Error saving audit log:', err.message);
  }
};

module.exports = auditLogger;
