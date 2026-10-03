const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const logAuditEvent = require('../middleware/audit');

const router = express.Router();

// Public: Get FAQs
router.get('/faqs', (req, res) => {
  try {
    const faqs = db.prepare('SELECT * FROM faq_items WHERE is_published = 1 ORDER BY sort_order ASC').all();
    return res.json({ faqs });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch FAQs' });
  }
});

// Admin: Manage FAQs
router.post('/admin/faqs', authenticateToken, requireRole(['super_admin', 'admin']), (req, res) => {
  try {
    const { question, answer, category, sort_order } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }

    const id = `faq_${Date.now()}`;
    db.prepare(`
      INSERT INTO faq_items (id, question, answer, category, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, question, answer, category || 'General', sort_order || 0);

    logAuditEvent(req.user.id, 'FAQ_CREATED', 'faq', id, { question }, req);

    return res.status(201).json({ message: 'FAQ created', id });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create FAQ' });
  }
});

// Admin: Delete FAQ
router.delete('/admin/faqs/:id', authenticateToken, requireRole(['super_admin', 'admin']), (req, res) => {
  try {
    db.prepare('DELETE FROM faq_items WHERE id = ?').run(req.params.id);
    return res.json({ message: 'FAQ deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete FAQ' });
  }
});

// Public: Active Announcements
router.get('/announcements', (req, res) => {
  try {
    const announcements = db.prepare('SELECT * FROM announcements WHERE is_active = 1 ORDER BY created_at DESC').all();
    return res.json({ announcements });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

module.exports = router;
