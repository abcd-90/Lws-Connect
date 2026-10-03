const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const logAuditEvent = require('../middleware/audit');

const router = express.Router();

// Get User's Conversations (or active 1-on-1 with Sami)
router.get('/conversations', authenticateToken, (req, res) => {
  try {
    let conversations;
    if (req.user.role === 'super_admin' || req.user.role === 'admin') {
      // Admin sees all active/flagged/archived conversations with user info & last message
      conversations = db.prepare(`
        SELECT 
          c.id, c.user_id, c.status, c.priority, c.assigned_to, c.created_at, c.updated_at,
          u.full_name as user_full_name, u.username as user_username, u.email as user_email, u.avatar_url as user_avatar_url, u.status as user_status,
          (SELECT body FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_body,
          (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
          (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND status != 'read') as unread_count
        FROM conversations c
        JOIN users u ON c.user_id = u.id
        ORDER BY c.updated_at DESC
      `).all(req.user.id);
    } else {
      // Regular user sees their conversation(s) with Sami admin details
      conversations = db.prepare(`
        SELECT 
          c.id, c.user_id, c.status, c.priority, c.assigned_to, c.created_at, c.updated_at,
          'Sami (Learn With Sami)' as recipient_name, 'sami' as recipient_username, 'sami@learnwithsami.com' as recipient_email,
          (SELECT body FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_body,
          (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
          (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND status != 'read') as unread_count
        FROM conversations c
        WHERE c.user_id = ?
        ORDER BY c.updated_at DESC
      `).all(req.user.id, req.user.id);
    }

    return res.json({ conversations });
  } catch (err) {
    console.error('Error fetching conversations:', err);
    return res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Ensure a user conversation exists (auto-create if missing)
router.post('/conversations/ensure', authenticateToken, (req, res) => {
  try {
    let conv = db.prepare('SELECT id FROM conversations WHERE user_id = ?').get(req.user.id);
    if (!conv) {
      const convId = `conv_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const admin = db.prepare('SELECT id FROM users WHERE role = "super_admin" OR role = "admin" LIMIT 1').get();
      const adminId = admin ? admin.id : 'usr-sami-admin';

      db.prepare(`
        INSERT INTO conversations (id, user_id, status, priority, assigned_to)
        VALUES (?, ?, 'active', 'normal', ?)
      `).run(convId, req.user.id, adminId);

      conv = { id: convId };
    }

    return res.json({ conversation_id: conv.id });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to ensure conversation' });
  }
});

// Get Messages for a conversation
router.get('/conversations/:id/messages', authenticateToken, (req, res) => {
  try {
    const convId = req.params.id;

    // Verify participant or admin
    const conv = db.prepare('SELECT * FROM conversations WHERE id = ?').get(convId);
    if (!conv) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (req.user.role === 'user' && conv.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized access to this conversation' });
    }

    const messages = db.prepare(`
      SELECT 
        m.id, m.conversation_id, m.sender_id, m.body, m.message_type, m.status, m.created_at,
        u.full_name as sender_name, u.username as sender_username, u.role as sender_role, u.avatar_url as sender_avatar,
        ma.id as attachment_id, ma.file_name, ma.file_path, ma.file_type, ma.file_size
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      LEFT JOIN message_attachments ma ON ma.message_id = m.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
    `).all(convId);

    // Mark messages from other user as read
    db.prepare(`
      UPDATE messages 
      SET status = 'read' 
      WHERE conversation_id = ? AND sender_id != ? AND status != 'read'
    `).run(convId, req.user.id);

    return res.json({ conversation: conv, messages });
  } catch (err) {
    console.error('Error fetching messages:', err);
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Post a Message
router.post('/conversations/:id/messages', authenticateToken, (req, res) => {
  try {
    const convId = req.params.id;
    const { body, attachment } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({ error: 'Message body cannot be empty' });
    }

    // Verify permission
    const conv = db.prepare('SELECT * FROM conversations WHERE id = ?').get(convId);
    if (!conv) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (req.user.role === 'user' && conv.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized access to conversation' });
    }

    const msgId = `msg_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const msgType = attachment ? (attachment.file_type && attachment.file_type.startsWith('image/') ? 'image' : 'file') : 'text';

    db.prepare(`
      INSERT INTO messages (id, conversation_id, sender_id, body, message_type, status)
      VALUES (?, ?, ?, ?, ?, 'delivered')
    `).run(msgId, convId, req.user.id, body.trim(), msgType);

    if (attachment) {
      const attachId = `att_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      db.prepare(`
        INSERT INTO message_attachments (id, message_id, file_name, file_path, file_type, file_size)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(attachId, msgId, attachment.file_name, attachment.file_path, attachment.file_type, attachment.file_size);
    }

    // Update conversation timestamp
    db.prepare('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(convId);

    // Fetch created message with sender info
    const fullMsg = db.prepare(`
      SELECT 
        m.id, m.conversation_id, m.sender_id, m.body, m.message_type, m.status, m.created_at,
        u.full_name as sender_name, u.username as sender_username, u.role as sender_role, u.avatar_url as sender_avatar,
        ma.id as attachment_id, ma.file_name, ma.file_path, ma.file_type, ma.file_size
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      LEFT JOIN message_attachments ma ON ma.message_id = m.id
      WHERE m.id = ?
    `).get(msgId);

    // Notify recipient
    const recipientId = req.user.role === 'user' ? (conv.assigned_to || 'usr-sami-admin') : conv.user_id;
    const notifId = `notif_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, body, type, link_url)
      VALUES (?, ?, ?, ?, 'message', ?)
    `).run(
      notifId,
      recipientId,
      req.user.role === 'user' ? `New message from ${req.user.full_name}` : `Reply from Sami`,
      body.length > 60 ? body.substring(0, 57) + '...' : body,
      req.user.role === 'user' ? '/admin/conversations' : '/app/messages'
    );

    return res.status(201).json({ message: fullMsg });
  } catch (err) {
    console.error('Error creating message:', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

// File Upload endpoint
router.post('/upload', authenticateToken, upload.single('attachment'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded or file format rejected' });
    }

    const relativePath = `/uploads/${req.file.filename}`;
    return res.json({
      file_name: req.file.originalname,
      file_path: relativePath,
      file_type: req.file.mimetype,
      file_size: req.file.size
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'File upload failed' });
  }
});

// Report Message / Conversation
router.post('/report', authenticateToken, (req, res) => {
  try {
    const { conversation_id, message_id, category, details } = req.body;
    if (!category) {
      return res.status(400).json({ error: 'Report category is required' });
    }

    const reportId = `rep_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    db.prepare(`
      INSERT INTO reports (id, reporter_id, conversation_id, message_id, category, details, status)
      VALUES (?, ?, ?, ?, ?, ?, 'open')
    `).run(reportId, req.user.id, conversation_id || null, message_id || null, category, details || null);

    logAuditEvent(req.user.id, 'REPORT_SUBMITTED', 'report', reportId, { category, conversation_id }, req);

    return res.status(201).json({ message: 'Report submitted for review', report_id: reportId });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to submit report' });
  }
});

module.exports = router;
