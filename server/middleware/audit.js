const db = require('../db');
const crypto = require('crypto');

function logAuditEvent(actorId, action, targetType, targetId, metadata = {}, req = null) {
  try {
    const id = `audit_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : '127.0.0.1';
    
    db.prepare(`
      INSERT INTO audit_logs (id, actor_id, action, target_type, target_id, metadata, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, actorId, action, targetType, targetId, JSON.stringify(metadata), ipAddress);
  } catch (err) {
    console.error('Failed to log audit event:', err);
  }
}

module.exports = logAuditEvent;
