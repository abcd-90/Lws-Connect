const db = require('./server/db');

// Force reset brand_settings row 1
db.prepare(`
  UPDATE brand_settings SET
    brand_name = 'LWS Direct',
    tagline = 'The direct line to Learn With Sami',
    primary_color = '#0F172A',
    secondary_color = '#D97706',
    accent_color = '#10B981',
    bg_color = '#0B0E14',
    surface_color = '#141923',
    text_color = '#F8FAFB',
    font_family = 'Plus Jakarta Sans, sans-serif',
    button_radius = '10px',
    card_radius = '16px',
    hero_headline = 'Your direct line to Learn With Sami.',
    hero_subheadline = 'Skip cluttered social DMs and public forums. LWS Direct provides a secure 1-on-1 workspace to ask questions, review code, and connect directly with Sami — without publicly exposing personal numbers.',
    hero_cta_text = 'Start a Conversation',
    footer_text = '© 2026 Learn With Sami. All rights reserved.',
    updated_at = CURRENT_TIMESTAMP
  WHERE id = 1
`).run();

// Force clear and reset theme_versions table
db.prepare('DELETE FROM theme_versions').run();

const defaultConfig = {
  brand_name: 'LWS Direct',
  tagline: 'The direct line to Learn With Sami',
  primary_color: '#0F172A',
  secondary_color: '#D97706',
  accent_color: '#10B981',
  bg_color: '#0B0E14',
  surface_color: '#141923',
  text_color: '#F8FAFB',
  font_family: 'Plus Jakarta Sans, sans-serif',
  button_radius: '10px',
  card_radius: '16px',
  hero_headline: 'Your direct line to Learn With Sami.',
  hero_subheadline: 'Skip cluttered social DMs and public forums. LWS Direct provides a secure 1-on-1 workspace to ask questions, review code, and connect directly with Sami — without publicly exposing personal numbers.',
  hero_cta_text: 'Start a Conversation',
  footer_text: '© 2026 Learn With Sami. All rights reserved.'
};

db.prepare(`
  INSERT INTO theme_versions (id, version_num, status, config_json, created_by)
  VALUES ('theme-v1-init', 1, 'published', ?, 'system')
`).run(JSON.stringify(defaultConfig));

console.log('DB reset complete.');
