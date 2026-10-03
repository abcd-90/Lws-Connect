const test = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const { app } = require('../index');

const request = supertest(app);

test('LWS Direct API End-to-End Test Suite', async (t) => {
  let userToken = '';
  let adminToken = '';
  let conversationId = '';

  await t.test('1. GET /api/config/active-theme should return valid default brand settings', async () => {
    const res = await request.get('/api/config/active-theme');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.brand);
    assert.ok(res.body.brand.brand_name.includes('LWS Direct'));
  });

  await t.test('2. POST /api/auth/login should authenticate Admin (Sami)', async () => {
    const res = await request.post('/api/auth/login').send({
      email_or_username: 'admin@lwsconnect.com',
      password: 'LwsSecureAdmin#2026!'
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.role, 'super_admin');
    adminToken = res.body.token;
  });

  await t.test('3. POST /api/auth/register should register a new user and create initial conversation', async () => {
    const uniqueName = `testuser_${Date.now()}`;
    const res = await request.post('/api/auth/register').send({
      full_name: 'Test Community Member',
      username: uniqueName,
      email: `${uniqueName}@example.com`,
      password: 'Password123!'
    });
    assert.strictEqual(res.status, 201);
    assert.ok(res.body.token);
    userToken = res.body.token;
  });

  await t.test('4. GET /api/chat/conversations should return user conversation', async () => {
    const res = await request.get('/api/chat/conversations')
      .set('Authorization', `Bearer ${userToken}`);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.conversations));
    assert.ok(res.body.conversations.length > 0);
    conversationId = res.body.conversations[0].id;
  });

  await t.test('5. POST /api/chat/conversations/:id/messages should send a message to Sami', async () => {
    const res = await request.post(`/api/chat/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ body: 'Hello Sami! Testing message functionality.' });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.message.body, 'Hello Sami! Testing message functionality.');
  });

  await t.test('6. POST /api/chat/conversations/:id/messages as Admin should reply to user', async () => {
    const res = await request.post(`/api/chat/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ body: 'Wa Alaikum Assalam! Admin response verified.' });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.message.body, 'Wa Alaikum Assalam! Admin response verified.');
  });

  await t.test('7. Admin Design Studio POST /api/config/design-studio/publish should publish theme updates', async () => {
    const newTheme = {
      brand_name: 'LWS Direct Custom',
      tagline: 'Direct Creator Channel',
      primary_color: '#1E293B',
      secondary_color: '#0284C7',
      accent_color: '#10B981',
      bg_color: '#0B0F19',
      surface_color: '#161F32',
      text_color: '#F8FAFC',
      font_family: 'Plus Jakarta Sans, sans-serif',
      button_radius: '10px',
      card_radius: '16px',
      hero_headline: 'Connect Directly with Learn With Sami',
      hero_subheadline: 'Private 1-on-1 creator platform.',
      hero_cta_text: 'Start Messaging Now',
      footer_text: '© 2026 Learn With Sami.'
    };

    const res = await request.post('/api/config/design-studio/publish')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newTheme);

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.version_num > 0);
  });
});
