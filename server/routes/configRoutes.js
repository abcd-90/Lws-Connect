const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const logAuditEvent = require('../middleware/audit');

const router = express.Router();

// Public: Get Active Published Theme & Brand Settings
router.get('/active-theme', (req, res) => {
  try {
    const brand = db.prepare('SELECT * FROM brand_settings WHERE id = 1').get();
    const activeVersion = db.prepare("SELECT * FROM theme_versions WHERE status = 'published' ORDER BY version_num DESC LIMIT 1").get();

    let parsedConfig = null;
    if (activeVersion && activeVersion.config_json) {
      if (typeof activeVersion.config_json === 'string') {
        try {
          parsedConfig = JSON.parse(activeVersion.config_json);
        } catch (e) {
          parsedConfig = null;
        }
      } else {
        parsedConfig = activeVersion.config_json;
      }
    }

    return res.json({
      brand: brand || {},
      active_version: activeVersion ? {
        id: activeVersion.id,
        version_num: activeVersion.version_num,
        config: parsedConfig
      } : null
    });
  } catch (err) {
    console.error('Error getting active theme:', err);
    return res.status(500).json({ error: 'Failed to fetch active theme settings' });
  }
});

// Admin: Save Theme Draft
router.post('/design-studio/save-draft', authenticateToken, requireRole(['super_admin', 'admin']), (req, res) => {
  try {
    const draftConfig = req.body;
    if (!draftConfig) {
      return res.status(400).json({ error: 'Theme configuration required' });
    }

    // Check if draft version exists
    let draftVersion = db.prepare("SELECT * FROM theme_versions WHERE status = 'draft'").get();

    if (draftVersion) {
      db.prepare('UPDATE theme_versions SET config_json = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(JSON.stringify(draftConfig), draftVersion.id);
    } else {
      const latestVer = db.prepare('SELECT MAX(version_num) as max_v FROM theme_versions').get();
      const nextNum = (latestVer && latestVer.max_v ? latestVer.max_v : 1) + 1;
      const draftId = `theme_draft_${Date.now()}`;

      db.prepare(`
        INSERT INTO theme_versions (id, version_num, status, config_json, created_by)
        VALUES (?, ?, 'draft', ?, ?)
      `).run(draftId, nextNum, JSON.stringify(draftConfig), req.user.id);
      
      draftVersion = { id: draftId, version_num: nextNum };
    }

    logAuditEvent(req.user.id, 'THEME_DRAFT_SAVED', 'theme', draftVersion.id, draftConfig, req);

    return res.json({ message: 'Theme draft saved successfully', draft_id: draftVersion.id });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save theme draft' });
  }
});

// Admin: Publish Theme (Updates brand_settings and marks version as published)
router.post('/design-studio/publish', authenticateToken, requireRole(['super_admin', 'admin']), (req, res) => {
  try {
    const themeConfig = req.body;
    if (!themeConfig || !themeConfig.brand_name) {
      return res.status(400).json({ error: 'Valid theme configuration required for publish' });
    }

    // Archive current published versions
    db.prepare("UPDATE theme_versions SET status = 'archived' WHERE status = 'published'").run();

    // Delete any draft
    db.prepare("DELETE FROM theme_versions WHERE status = 'draft'").run();

    // Create new published version
    const latestVer = db.prepare('SELECT MAX(version_num) as max_v FROM theme_versions').get();
    const nextNum = (latestVer && latestVer.max_v ? latestVer.max_v : 0) + 1;
    const pubId = `theme_v${nextNum}_${Date.now()}`;

    db.prepare(`
      INSERT INTO theme_versions (id, version_num, status, config_json, created_by)
      VALUES (?, ?, 'published', ?, ?)
    `).run(pubId, nextNum, JSON.stringify(themeConfig), req.user.id);

    // Update active brand_settings table
    db.prepare(`
      UPDATE brand_settings SET
        brand_name = ?,
        tagline = ?,
        primary_color = ?,
        secondary_color = ?,
        accent_color = ?,
        bg_color = ?,
        surface_color = ?,
        text_color = ?,
        font_family = ?,
        button_radius = ?,
        card_radius = ?,
        hero_headline = ?,
        hero_subheadline = ?,
        hero_cta_text = ?,
        footer_text = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(
      themeConfig.brand_name || 'LWS Direct',
      themeConfig.tagline || 'The direct line to Learn With Sami',
      themeConfig.primary_color || '#0F172A',
      themeConfig.secondary_color || '#0284C7',
      themeConfig.accent_color || '#10B981',
      themeConfig.bg_color || '#090D16',
      themeConfig.surface_color || '#111827',
      themeConfig.text_color || '#F9FAFB',
      themeConfig.font_family || 'Plus Jakarta Sans, sans-serif',
      themeConfig.button_radius || '8px',
      themeConfig.card_radius || '12px',
      themeConfig.hero_headline || 'Connect Directly with Learn With Sami',
      themeConfig.hero_subheadline || 'A private, secure platform for the LWS community to ask questions, receive feedback, and collaborate directly with Sami.',
      themeConfig.hero_cta_text || 'Start a Conversation',
      themeConfig.footer_text || '© 2026 Learn With Sami. All rights reserved.'
    );

    logAuditEvent(req.user.id, 'THEME_PUBLISHED', 'theme', pubId, { version: nextNum }, req);

    return res.json({
      message: 'Theme published successfully! Public application is now using the new configuration.',
      version_num: nextNum,
      theme: themeConfig
    });
  } catch (err) {
    console.error('Publish theme error:', err);
    return res.status(500).json({ error: 'Failed to publish theme' });
  }
});

// Admin: Get Version History
router.get('/theme-versions', authenticateToken, requireRole(['super_admin', 'admin']), (req, res) => {
  try {
    const versions = db.prepare(`
      SELECT tv.id, tv.version_num, tv.status, tv.created_at, u.full_name as creator_name
      FROM theme_versions tv
      LEFT JOIN users u ON tv.created_by = u.id
      ORDER BY tv.version_num DESC
    `).all();

    return res.json({ versions });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch theme versions' });
  }
});

// Admin: Rollback to specific version
router.post('/design-studio/rollback/:id', authenticateToken, requireRole(['super_admin', 'admin']), (req, res) => {
  try {
    const targetVersion = db.prepare('SELECT * FROM theme_versions WHERE id = ?').get(req.params.id);
    if (!targetVersion) {
      return res.status(404).json({ error: 'Theme version not found' });
    }

    const config = JSON.parse(targetVersion.config_json);

    // Set all to archived
    db.prepare("UPDATE theme_versions SET status = 'archived'").run();
    // Set target to published
    db.prepare("UPDATE theme_versions SET status = 'published' WHERE id = ?", [targetVersion.id]).run();

    // Update brand_settings
    db.prepare(`
      UPDATE brand_settings SET
        brand_name = ?, tagline = ?, primary_color = ?, secondary_color = ?, accent_color = ?,
        bg_color = ?, surface_color = ?, text_color = ?, font_family = ?, button_radius = ?,
        card_radius = ?, hero_headline = ?, hero_subheadline = ?, hero_cta_text = ?, footer_text = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(
      config.brand_name, config.tagline, config.primary_color, config.secondary_color, config.accent_color,
      config.bg_color, config.surface_color, config.text_color, config.font_family, config.button_radius,
      config.card_radius, config.hero_headline, config.hero_subheadline, config.hero_cta_text, config.footer_text
    );

    logAuditEvent(req.user.id, 'THEME_ROLLBACK', 'theme', targetVersion.id, { version: targetVersion.version_num }, req);

    return res.json({ message: `Rollback to version ${targetVersion.version_num} complete.`, config });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to rollback theme' });
  }
});

module.exports = router;
