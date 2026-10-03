const express = require('express');
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const logAuditEvent = require('../middleware/audit');

const router = express.Router();

// Apply auth & admin check to all admin routes
router.use(authenticateToken);
router.use(requireRole(['super_admin', 'admin']));

// Real Admin Analytics
router.get('/analytics', (req, res) => {
  try {
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user'").get().count;
    const activeUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user' AND status = 'active'").get().count;
    const blockedUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'blocked'").get().count;
    
    const totalConversations = db.prepare('SELECT COUNT(*) as count FROM conversations').get().count;
    const activeConversations = db.prepare("SELECT COUNT(*) as count FROM conversations WHERE status = 'active'").get().count;
    const unreadMessages = db.prepare("SELECT COUNT(*) as count FROM messages WHERE sender_id != ? AND status != 'read'").get(req.user.id).count;
    const totalMessages = db.prepare('SELECT COUNT(*) as count FROM messages').get().count;

    const openReports = db.prepare("SELECT COUNT(*) as count FROM reports WHERE status = 'open'").get().count;

    // Daily activity data for the last 7 days from messages table
    const dailyActivity = db.prepare(`
      SELECT strftime('%Y-%m-%d', created_at) as date, COUNT(*) as count
      FROM messages
      GROUP BY strftime('%Y-%m-%d', created_at)
      ORDER BY date DESC
      LIMIT 7
    `).all();

    return res.json({
      metrics: {
        totalUsers,
        activeUsers,
        blockedUsers,
        totalConversations,
        activeConversations,
        unreadMessages,
        totalMessages,
        openReports
      },
      dailyActivity
    });
  } catch (err) {
    console.error('Analytics query error:', err);
    return res.status(500).json({ error: 'Failed to compute analytics metrics' });
  }
});

// Admin Get All Users
router.get('/users', (req, res) => {
  try {
    const { search, status, role } = req.query;
    let query = `
      SELECT u.id, u.email, u.full_name, u.username, u.avatar_url, u.role, u.status, u.bio, u.created_at, u.last_active_at,
             (SELECT COUNT(*) FROM conversations WHERE user_id = u.id) as conversation_count,
             (SELECT COUNT(*) FROM messages WHERE sender_id = u.id) as message_count
      FROM users u
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (u.full_name LIKE ? OR u.email LIKE ? OR u.username LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      query += ` AND u.status = ?`;
      params.push(status);
    }

    if (role) {
      query += ` AND u.role = ?`;
      params.push(role);
    }

    query += ` ORDER BY u.created_at DESC`;

    const users = db.prepare(query).all(...params);
    return res.json({ users });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch users list' });
  }
});

// Block User
router.post('/users/:id/block', (req, res) => {
  try {
    const userId = req.params.id;
    const { reason } = req.body;

    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'super_admin') {
      return res.status(403).json({ error: 'Cannot block a super admin account' });
    }

    db.prepare("UPDATE users SET status = 'blocked' WHERE id = ?").run(userId);
    
    // Add entry in blocked_users table
    db.prepare(`
      INSERT INTO blocked_users (id, user_id, blocked_by, reason)
      VALUES (?, ?, ?, ?)
    `).run(`blk_${Date.now()}`, userId, req.user.id, reason || 'Violation of platform rules');

    logAuditEvent(req.user.id, 'USER_BLOCKED', 'user', userId, { reason }, req);

    return res.json({ message: 'User blocked successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to block user' });
  }
});

// Unblock User
router.post('/users/:id/unblock', (req, res) => {
  try {
    const userId = req.params.id;

    db.prepare("UPDATE users SET status = 'active' WHERE id = ?").run(userId);
    db.prepare('DELETE FROM blocked_users WHERE user_id = ?').run(userId);

    logAuditEvent(req.user.id, 'USER_UNBLOCKED', 'user', userId, {}, req);

    return res.json({ message: 'User unblocked successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to unblock user' });
  }
});

// Update Conversation Status or Priority
router.put('/conversations/:id', (req, res) => {
  try {
    const convId = req.params.id;
    const { status, priority } = req.body;

    db.prepare(`
      UPDATE conversations 
      SET status = COALESCE(?, status),
          priority = COALESCE(?, priority),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, priority, convId);

    logAuditEvent(req.user.id, 'CONVERSATION_UPDATED', 'conversation', convId, { status, priority }, req);

    return res.json({ message: 'Conversation updated' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update conversation' });
  }
});

// Moderation Reports List
router.get('/reports', (req, res) => {
  try {
    const reports = db.prepare(`
      SELECT 
        r.id, r.reporter_id, r.conversation_id, r.message_id, r.category, r.details, r.status, r.created_at,
        u.full_name as reporter_name, u.email as reporter_email,
        m.body as message_body
      FROM reports r
      JOIN users u ON r.reporter_id = u.id
      LEFT JOIN messages m ON r.message_id = m.id
      ORDER BY r.created_at DESC
    `).all();

    return res.json({ reports });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch moderation reports' });
  }
});

// Resolve Report
router.post('/reports/:id/resolve', (req, res) => {
  try {
    const reportId = req.params.id;
    db.prepare("UPDATE reports SET status = 'resolved' WHERE id = ?").run(reportId);
    logAuditEvent(req.user.id, 'REPORT_RESOLVED', 'report', reportId, {}, req);
    return res.json({ message: 'Report resolved' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to resolve report' });
  }
});

// Audit Logs Query
router.get('/audit-logs', (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT 
        a.id, a.actor_id, a.action, a.target_type, a.target_id, a.metadata, a.ip_address, a.created_at,
        u.full_name as actor_name, u.username as actor_username
      FROM audit_logs a
      LEFT JOIN users u ON a.actor_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 100
    `).all();

    return res.json({ audit_logs: logs });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

module.exports = router;
