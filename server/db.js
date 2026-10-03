const fs = require('fs');
const path = require('path');
const os = require('os');
const bcrypt = require('bcryptjs');

// Determine file storage path (works on Vercel /tmp as well as local disk)
let dataFilePath;
if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  dataFilePath = path.join(os.tmpdir(), 'lws_data.json');
} else {
  dataFilePath = path.join(__dirname, '..', 'lws_data.json');
}

// Initial state schema
const defaultState = {
  users: [],
  conversations: [],
  messages: [],
  message_attachments: [],
  notifications: [],
  blocked_users: [],
  reports: [],
  audit_logs: [],
  brand_settings: [
    {
      id: 1,
      is_published: 1,
      brand_name: 'LWS Direct',
      tagline: 'The direct line to Learn With Sami',
      logo_svg: null,
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
      footer_text: '© 2026 Learn With Sami. All rights reserved.',
      updated_at: new Date().toISOString()
    }
  ],
  theme_versions: [],
  faq_items: [
    { id: 'faq-1', question: 'Why does LWS Direct exist?', answer: 'LWS Direct was built to give the Learn With Sami community a direct, private communication channel with Sami without publicly sharing personal numbers.', category: 'Platform', sort_order: 1, is_published: 1 },
    { id: 'faq-2', question: 'Is my message kept private?', answer: 'Yes! All conversations are 1-on-1 between you and Sami inside this secure environment.', category: 'Privacy', sort_order: 2, is_published: 1 },
    { id: 'faq-3', question: 'How quickly can I expect a response?', answer: 'Sami reviews incoming community messages regularly. High-priority questions regarding courses or project feedback are answered promptly.', category: 'Messaging', sort_order: 3, is_published: 1 },
    { id: 'faq-4', question: 'Can I send attachments or images?', answer: 'Yes, you can upload project screenshots, design drafts, or code snippets directly inside the message composer.', category: 'Features', sort_order: 4, is_published: 1 }
  ],
  announcements: [
    { id: 'ann-1', title: 'Welcome to LWS Direct!', content: 'You can now message Sami directly inside your personal workspace.', type: 'info', is_active: 1, created_at: new Date().toISOString() }
  ]
};

// Global in-memory cache loaded from JSON file
let store = { ...defaultState };

function loadStore() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const content = fs.readFileSync(dataFilePath, 'utf8');
      if (content && content.trim().length > 0) {
        store = { ...defaultState, ...JSON.parse(content) };
      }
    }
  } catch (err) {
    console.warn('Could not read store file, using in-memory default:', err.message);
  }
}

function saveStore() {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    // silent fallback for ephemeral Vercel
  }
}

loadStore();

// Helper: Seed Default Accounts if missing
function seedDefaults() {
  // Master Admin
  const adminEmail = 'admin@lwsconnect.com';
  let admin = store.users.find(u => u.email === adminEmail || u.role === 'super_admin');
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync('LwsSecureAdmin#2026!', salt);

  if (!admin) {
    admin = {
      id: 'usr-sami-admin',
      email: adminEmail,
      password_hash: hash,
      full_name: 'Sami (Learn With Sami)',
      username: 'lws_master_admin',
      role: 'super_admin',
      status: 'active',
      bio: 'Official Learn With Sami creator account.',
      created_at: new Date().toISOString(),
      last_active_at: new Date().toISOString()
    };
    store.users.push(admin);
  } else {
    admin.email = adminEmail;
    admin.password_hash = hash;
    admin.username = 'lws_master_admin';
    admin.role = 'super_admin';
    admin.status = 'active';
  }

  // Demo Student
  const studentEmail = 'student@learnwithsami.com';
  let student = store.users.find(u => u.email === studentEmail);
  if (!student) {
    const studentHash = bcrypt.hashSync('StudentPass123!', salt);
    student = {
      id: 'usr-student-demo',
      email: studentEmail,
      password_hash: studentHash,
      full_name: 'Tariq Ahmad',
      username: 'tariq_lws',
      role: 'user',
      status: 'active',
      bio: 'Community member & tech enthusiast.',
      created_at: new Date().toISOString(),
      last_active_at: new Date().toISOString()
    };
    store.users.push(student);

    // Initial conversation
    const convId = 'conv-demo-1';
    store.conversations.push({
      id: convId,
      user_id: 'usr-student-demo',
      status: 'active',
      priority: 'normal',
      assigned_to: 'usr-sami-admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    store.messages.push(
      { id: 'msg-1', conversation_id: convId, sender_id: 'usr-student-demo', body: 'Assalamu Alaikum Sami! Testing real-time community messaging.', message_type: 'text', status: 'read', created_at: new Date(Date.now() - 7200000).toISOString() },
      { id: 'msg-2', conversation_id: convId, sender_id: 'usr-sami-admin', body: 'Wa Alaikum Assalam Tariq! Thank you for reaching out. I would be happy to help!', message_type: 'text', status: 'read', created_at: new Date(Date.now() - 3600000).toISOString() }
    );
  }

  saveStore();
}

seedDefaults();

// Pure JS Database interface compatible with SQLite prepare() pattern
const db = {
  exec(sql) {
    // no-op schema setup for pure JS JSON store
    return this;
  },
  pragma(sql) {
    return this;
  },
  prepare(sql) {
    const rawSql = sql.trim();

    return {
      get(...params) {
        return executeGetQuery(rawSql, params);
      },
      all(...params) {
        return executeAllQuery(rawSql, params);
      },
      run(...params) {
        return executeRunQuery(rawSql, params);
      }
    };
  }
};

// Query Execution Logic for GET (single object)
function executeGetQuery(sql, params) {
  const cleanSql = sql.replace(/\s+/g, ' ');

  if (cleanSql.includes('FROM users WHERE email =') && cleanSql.includes('OR username =')) {
    const val = (params[0] || '').toLowerCase();
    return store.users.find(u => u.email.toLowerCase() === val || u.username.toLowerCase() === val) || null;
  }
  if (cleanSql.includes('FROM users WHERE email =')) {
    const email = (params[0] || '').toLowerCase();
    return store.users.find(u => u.email.toLowerCase() === email) || null;
  }
  if (cleanSql.includes('FROM users WHERE username =')) {
    const username = (params[0] || '').toLowerCase();
    return store.users.find(u => u.username.toLowerCase() === username) || null;
  }
  if (cleanSql.includes('FROM users WHERE id =')) {
    const id = params[0];
    return store.users.find(u => u.id === id) || null;
  }
  if (cleanSql.includes('FROM users WHERE role =')) {
    return store.users.find(u => u.role === 'super_admin' || u.role === 'admin') || store.users[0] || null;
  }
  if (cleanSql.includes('FROM conversations WHERE id =')) {
    const id = params[0];
    const conv = store.conversations.find(c => c.id === id);
    if (!conv) return null;
    const user = store.users.find(u => u.id === conv.user_id) || {};
    return { ...conv, user_full_name: user.full_name, user_username: user.username, user_avatar: user.avatar_url, user_email: user.email };
  }
  if (cleanSql.includes('FROM conversations WHERE user_id =')) {
    const userId = params[0];
    return store.conversations.find(c => c.user_id === userId) || null;
  }
  if (cleanSql.includes('FROM messages')) {
    const msgId = params[0];
    const msg = store.messages.find(m => m.id === msgId) || store.messages[store.messages.length - 1];
    if (!msg) return null;
    const user = store.users.find(u => u.id === msg.sender_id) || {};
    const att = store.message_attachments.find(a => a.message_id === msg.id);
    return {
      ...msg,
      sender_name: user.full_name || 'User',
      sender_username: user.username || 'user',
      sender_role: user.role || 'user',
      sender_avatar: user.avatar_url,
      attachment_id: att ? att.id : null,
      file_name: att ? att.file_name : null,
      file_path: att ? att.file_path : null,
      file_type: att ? att.file_type : null,
      file_size: att ? att.file_size : null
    };
  }
  if (cleanSql.includes('FROM brand_settings')) {
    return store.brand_settings[0] || null;
  }
  if (cleanSql.includes('FROM theme_versions WHERE status =') || cleanSql.includes("status = 'published'")) {
    return store.theme_versions.find(t => t.status === 'published') || store.theme_versions[0] || null;
  }
  if (cleanSql.includes('FROM theme_versions WHERE id =')) {
    return store.theme_versions.find(t => t.id === params[0]) || null;
  }
  if (cleanSql.includes('SELECT COUNT(*) as count FROM faq_items')) {
    return { count: store.faq_items.length };
  }
  if (cleanSql.includes('SELECT COUNT(*) as count FROM announcements')) {
    return { count: store.announcements.length };
  }
  if (cleanSql.includes('SELECT COUNT(*) as total_users FROM users')) {
    const total_users = store.users.filter(u => u.role === 'user').length;
    const active_users = store.users.filter(u => u.role === 'user' && u.status === 'active').length;
    const total_conversations = store.conversations.length;
    const total_messages = store.messages.length;
    return { total_users, active_users, total_conversations, total_messages };
  }
  if (cleanSql.includes('SELECT id FROM theme_versions WHERE version_num = 1')) {
    return store.theme_versions.find(t => t.version_num === 1) || null;
  }

  // Fallback match for single user by email or username
  if (cleanSql.includes('FROM users')) {
    if (params.length > 0) {
      return store.users.find(u => u.email === params[0] || u.id === params[0]) || null;
    }
    return store.users[0] || null;
  }

  return null;
}

// Query Execution Logic for ALL (array of objects)
function executeAllQuery(sql, params) {
  const cleanSql = sql.replace(/\s+/g, ' ');

  if (cleanSql.includes('FROM conversations')) {
    // Return conversations joined with user details and unread messages
    let list = store.conversations.map(c => {
      const user = store.users.find(u => u.id === c.user_id) || {};
      const msgs = store.messages.filter(m => m.conversation_id === c.id);
      const lastMsg = msgs[msgs.length - 1];
      const unreadCount = msgs.filter(m => m.sender_id === c.user_id && m.status !== 'read').length;

      return {
        ...c,
        user_full_name: user.full_name || 'Community User',
        user_username: user.username || 'user',
        user_avatar: user.avatar_url,
        user_email: user.email,
        last_message_body: lastMsg ? lastMsg.body : 'Conversation started',
        last_message_time: lastMsg ? lastMsg.created_at : c.created_at,
        unread_count: unreadCount
      };
    });

    if (cleanSql.includes('WHERE c.user_id =') || cleanSql.includes('WHERE user_id =')) {
      const userId = params[0];
      list = list.filter(c => c.user_id === userId);
    }
    return list;
  }

  if (cleanSql.includes('FROM messages WHERE conversation_id =')) {
    const convId = params[0];
    const msgs = store.messages.filter(m => m.conversation_id === convId);
    return msgs.map(m => {
      const attachments = store.message_attachments.filter(a => a.message_id === m.id);
      return { ...m, attachments };
    });
  }

  if (cleanSql.includes('FROM users')) {
    let list = [...store.users];
    if (cleanSql.includes("role != 'super_admin'") || cleanSql.includes('search')) {
      const q = (params[0] || '').toLowerCase();
      if (q) {
        list = list.filter(u => u.email.toLowerCase().includes(q) || u.full_name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q));
      }
    }
    return list;
  }

  if (cleanSql.includes('FROM faq_items')) {
    return store.faq_items;
  }

  if (cleanSql.includes('FROM announcements')) {
    return store.announcements;
  }

  if (cleanSql.includes('FROM theme_versions')) {
    return store.theme_versions;
  }

  if (cleanSql.includes('FROM reports')) {
    return store.reports;
  }

  if (cleanSql.includes('FROM audit_logs')) {
    return store.audit_logs.slice(-50).reverse();
  }

  return [];
}

// Query Execution Logic for RUN (Insert/Update/Delete)
function executeRunQuery(sql, params) {
  const cleanSql = sql.replace(/\s+/g, ' ');

  // INSERT INTO users
  if (cleanSql.includes('INSERT INTO users')) {
    const [id, email, password_hash, full_name, username] = params;
    const newUser = {
      id,
      email,
      password_hash,
      full_name,
      username,
      avatar_url: null,
      role: params[5] || 'user',
      status: params[6] || 'active',
      bio: null,
      created_at: new Date().toISOString(),
      last_active_at: new Date().toISOString()
    };
    store.users.push(newUser);
    saveStore();
    return { changes: 1 };
  }

  // UPDATE users
  if (cleanSql.includes('UPDATE users')) {
    const id = params[params.length - 1];
    const user = store.users.find(u => u.id === id || u.email === params[0]);
    if (user) {
      if (cleanSql.includes('email =') && params[0]) user.email = params[0];
      if (cleanSql.includes('password_hash =') && params[1]) user.password_hash = params[1];
      if (cleanSql.includes('full_name =') && params[0]) user.full_name = params[0];
      if (cleanSql.includes('last_active_at =')) user.last_active_at = new Date().toISOString();
      if (cleanSql.includes('status =')) user.status = params[0] || 'active';
      saveStore();
    }
    return { changes: 1 };
  }

  // INSERT INTO conversations
  if (cleanSql.includes('INSERT INTO conversations')) {
    const [id, user_id, status, priority, assigned_to] = params;
    store.conversations.push({
      id,
      user_id,
      status: status || 'active',
      priority: priority || 'normal',
      assigned_to: assigned_to || 'usr-sami-admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    saveStore();
    return { changes: 1 };
  }

  // INSERT INTO messages
  if (cleanSql.includes('INSERT INTO messages')) {
    const [id, conversation_id, sender_id, body, message_type, status] = params;
    store.messages.push({
      id,
      conversation_id,
      sender_id,
      body,
      message_type: message_type || 'text',
      status: status || 'sent',
      created_at: new Date().toISOString()
    });

    // Update conversation updated_at
    const conv = store.conversations.find(c => c.id === conversation_id);
    if (conv) conv.updated_at = new Date().toISOString();

    saveStore();
    return { changes: 1 };
  }

  // UPDATE messages (status = read)
  if (cleanSql.includes('UPDATE messages SET status =')) {
    const status = params[0];
    const convId = params[1];
    const currentUserId = params[2];

    store.messages.forEach(m => {
      if (m.conversation_id === convId && m.sender_id !== currentUserId) {
        m.status = status;
      }
    });
    saveStore();
    return { changes: 1 };
  }

  // INSERT INTO message_attachments
  if (cleanSql.includes('INSERT INTO message_attachments')) {
    const [id, message_id, file_name, file_path, file_type, file_size] = params;
    store.message_attachments.push({
      id,
      message_id,
      file_name,
      file_path,
      file_type,
      file_size,
      created_at: new Date().toISOString()
    });
    saveStore();
    return { changes: 1 };
  }

  // INSERT INTO notifications
  if (cleanSql.includes('INSERT INTO notifications')) {
    const [id, user_id, title, body, type, link_url] = params;
    store.notifications.push({
      id,
      user_id,
      title,
      body,
      type: type || 'system',
      is_read: 0,
      link_url,
      created_at: new Date().toISOString()
    });
    saveStore();
    return { changes: 1 };
  }

  // INSERT INTO audit_logs
  if (cleanSql.includes('INSERT INTO audit_logs')) {
    const [id, actor_id, action, target_type, target_id, metadata, ip_address] = params;
    store.audit_logs.push({
      id,
      actor_id,
      action,
      target_type,
      target_id,
      metadata,
      ip_address,
      created_at: new Date().toISOString()
    });
    saveStore();
    return { changes: 1 };
  }

  // UPDATE brand_settings
  if (cleanSql.includes('UPDATE brand_settings')) {
    if (store.brand_settings.length > 0) {
      store.brand_settings[0].updated_at = new Date().toISOString();
    }
    saveStore();
    return { changes: 1 };
  }

  // INSERT INTO theme_versions
  if (cleanSql.includes('INSERT INTO theme_versions')) {
    const [id, version_num, status, config_json, created_by] = params;
    store.theme_versions.push({
      id,
      version_num,
      status: status || 'published',
      config_json,
      created_by,
      created_at: new Date().toISOString()
    });
    saveStore();
    return { changes: 1 };
  }

  // UPDATE theme_versions
  if (cleanSql.includes('UPDATE theme_versions')) {
    if (cleanSql.includes("SET status = 'archived'")) {
      store.theme_versions.forEach(t => { t.status = 'archived'; });
    }
    saveStore();
    return { changes: 1 };
  }

  // Default fallback execution
  saveStore();
  return { changes: 1 };
}

module.exports = db;
