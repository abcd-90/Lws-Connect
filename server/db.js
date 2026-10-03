const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'lws_direct.db');
const db = new Database(dbPath);

// Enable WAL mode for high performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      avatar_url TEXT,
      role TEXT NOT NULL DEFAULT 'user', -- 'super_admin', 'admin', 'user'
      status TEXT NOT NULL DEFAULT 'active', -- 'active', 'blocked'
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active', -- 'active', 'archived', 'flagged'
      priority TEXT NOT NULL DEFAULT 'normal', -- 'normal', 'high', 'urgent'
      assigned_to TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      body TEXT NOT NULL,
      message_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'image', 'file', 'system'
      status TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'delivered', 'read'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS message_attachments (
      id TEXT PRIMARY KEY,
      message_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'message', -- 'message', 'system', 'security'
      is_read INTEGER NOT NULL DEFAULT 0,
      link_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS blocked_users (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      blocked_by TEXT NOT NULL,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (blocked_by) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      reporter_id TEXT NOT NULL,
      conversation_id TEXT,
      message_id TEXT,
      category TEXT NOT NULL, -- 'spam', 'harassment', 'abuse', 'other'
      details TEXT,
      status TEXT NOT NULL DEFAULT 'open', -- 'open', 'reviewing', 'resolved'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor_id TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      metadata TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS brand_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      is_published INTEGER DEFAULT 1,
      brand_name TEXT NOT NULL DEFAULT 'LWS Direct',
      tagline TEXT NOT NULL DEFAULT 'The direct line to Learn With Sami',
      logo_svg TEXT,
      primary_color TEXT NOT NULL DEFAULT '#0F172A',
      secondary_color TEXT NOT NULL DEFAULT '#0284C7',
      accent_color TEXT NOT NULL DEFAULT '#10B981',
      bg_color TEXT NOT NULL DEFAULT '#090D16',
      surface_color TEXT NOT NULL DEFAULT '#111827',
      text_color TEXT NOT NULL DEFAULT '#F9FAFB',
      font_family TEXT NOT NULL DEFAULT 'Plus Jakarta Sans, sans-serif',
      button_radius TEXT NOT NULL DEFAULT '8px',
      card_radius TEXT NOT NULL DEFAULT '12px',
      hero_headline TEXT NOT NULL DEFAULT 'Connect Directly with Learn With Sami',
      hero_subheadline TEXT NOT NULL DEFAULT 'A private, secure platform for the LWS community to ask questions, receive feedback, and collaborate directly with Sami without exposing personal numbers.',
      hero_cta_text TEXT NOT NULL DEFAULT 'Start a Conversation',
      footer_text TEXT NOT NULL DEFAULT '© 2026 Learn With Sami. All rights reserved. Built for private community connection.',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS theme_versions (
      id TEXT PRIMARY KEY,
      version_num INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'published', -- 'draft', 'published', 'archived'
      config_json TEXT NOT NULL,
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS faq_items (
      id TEXT PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'General',
      sort_order INTEGER DEFAULT 0,
      is_published INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info',
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure active brand settings are clean LWS Direct defaults
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

  // Reset published theme version
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

  db.prepare("UPDATE theme_versions SET config_json = ? WHERE status = 'published'").run(JSON.stringify(defaultConfig));

  // Seed default Theme Version
  const existingTheme = db.prepare('SELECT id FROM theme_versions WHERE version_num = 1').get();
  if (!existingTheme) {
    const defaultConfig = {
      brand_name: 'LWS Direct',
      tagline: 'The direct line to Learn With Sami',
      primary_color: '#0F172A',
      secondary_color: '#0284C7',
      accent_color: '#10B981',
      bg_color: '#090D16',
      surface_color: '#111827',
      text_color: '#F9FAFB',
      font_family: 'Plus Jakarta Sans, sans-serif',
      button_radius: '8px',
      card_radius: '12px',
      hero_headline: 'Connect Directly with Learn With Sami',
      hero_subheadline: 'A private, secure platform for the LWS community to ask questions, receive feedback, and collaborate directly with Sami without exposing personal numbers.',
      hero_cta_text: 'Start a Conversation',
      footer_text: '© 2026 Learn With Sami. All rights reserved. Built for private community connection.'
    };

    db.prepare(`
      INSERT INTO theme_versions (id, version_num, status, config_json, created_by)
      VALUES ('theme-v1-init', 1, 'published', ?, 'system')
    `).run(JSON.stringify(defaultConfig));
  }

  // Seed or Update Master Admin Account
  const adminEmail = 'admin@lwsconnect.com';
  const adminPass = 'LwsSecureAdmin#2026!';
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(adminPass, salt);

  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ? OR role = ?').get(adminEmail, 'super_admin');
  if (!existingAdmin) {
    db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, username, role, status, bio)
      VALUES ('usr-sami-admin', ?, ?, 'Sami (Learn With Sami)', 'lws_master_admin', 'super_admin', 'active', 'Official Learn With Sami creator account.')
    `).run(adminEmail, hash);
  } else {
    db.prepare(`
      UPDATE users SET email = ?, password_hash = ?, username = 'lws_master_admin', role = 'super_admin', status = 'active' WHERE id = ?
    `).run(adminEmail, hash, existingAdmin.id);
  }

  // Seed Demo User if missing
  const demoUser = db.prepare('SELECT id FROM users WHERE email = ?').get('student@learnwithsami.com');
  if (!demoUser) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('StudentPass123!', salt);
    db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, username, role, status, bio)
      VALUES ('usr-student-demo', 'student@learnwithsami.com', ?, 'Tariq Ahmad', 'tariq_lws', 'user', 'active', 'Community member & tech enthusiast.')
    `).run(hash);

    // Seed initial conversation
    const convId = 'conv-demo-1';
    db.prepare(`
      INSERT INTO conversations (id, user_id, status, priority, assigned_to)
      VALUES (?, 'usr-student-demo', 'active', 'normal', 'usr-sami-admin')
    `).run(convId);

    // Seed initial messages
    db.prepare(`
      INSERT INTO messages (id, conversation_id, sender_id, body, status, created_at)
      VALUES 
        ('msg-1', ?, 'usr-student-demo', 'Assalamu Alaikum Sami! Loved your latest tutorial on full-stack web applications. I had a quick question about real-time database architecture.', 'read', datetime('now', '-2 hours')),
        ('msg-2', ?, 'usr-sami-admin', 'Wa Alaikum Assalam Tariq! Thank you so much for reaching out. I would be happy to help. For real-time updates, SQLite with WebSockets or Supabase Realtime work wonderfully for instant event broadcasting!', 'read', datetime('now', '-1 hour'))
    `).run(convId, convId);
  }

  // Seed FAQs if empty
  const faqCount = db.prepare('SELECT COUNT(*) as count FROM faq_items').get().count;
  if (faqCount === 0) {
    const faqs = [
      { id: 'faq-1', question: 'Why does LWS Direct exist?', answer: 'LWS Direct was built to give the Learn With Sami community a direct, private communication channel with Sami without publicly sharing personal numbers or depending solely on third-party messaging apps like Telegram.', category: 'Platform', order: 1 },
      { id: 'faq-2', question: 'Is my message kept private?', answer: 'Yes! All conversations are 1-on-1 between you and Sami inside this secure environment. Your contact details remain confidential.', category: 'Privacy', order: 2 },
      { id: 'faq-3', question: 'How quickly can I expect a response?', answer: 'Sami reviews incoming community messages regularly. High-priority questions regarding courses or project feedback are answered promptly.', category: 'Messaging', order: 3 },
      { id: 'faq-4', question: 'Can I send attachments or images?', answer: 'Yes, you can upload project screenshots, design drafts, or code snippets directly inside the message composer.', category: 'Features', order: 4 }
    ];

    const stmt = db.prepare('INSERT INTO faq_items (id, question, answer, category, sort_order) VALUES (?, ?, ?, ?, ?)');
    faqs.forEach(f => stmt.run(f.id, f.question, f.answer, f.category, f.order));
  }

  // Seed Announcements if empty
  const annCount = db.prepare('SELECT COUNT(*) as count FROM announcements').get().count;
  if (annCount === 0) {
    db.prepare(`
      INSERT INTO announcements (id, title, content, type, is_active)
      VALUES ('ann-1', 'Welcome to LWS Direct!', 'You can now message Sami directly inside your personal workspace. Experience 1-on-1 creator communication.', 'info', 1)
    `).run();
  }
}

initDb();

module.exports = db;
