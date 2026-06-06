import assert from 'node:assert/strict';
import test from 'node:test';

import { ensureContentFile, writeContent, DEFAULT_CONTENT } from '../storage/contentFileStore.js';

process.env.NODE_ENV = 'test';
process.env.ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin@example.com';
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Test123!Strong';
process.env.CONTENT_RATE_LIMIT_MAX = '2';
process.env.CONTENT_RATE_LIMIT_WINDOW_MS = '60000';
process.env.ADMIN_LOGIN_RATE_LIMIT_MAX = '2';
process.env.ADMIN_LOGIN_RATE_LIMIT_WINDOW_MS = '60000';
process.env.ADMIN_EVENT_PASSWORD = process.env.ADMIN_EVENT_PASSWORD || 'TestEventPassword123!';

const { default: app } = await import('../index.js');

let server;
let baseUrl;

test.before(async () => {
  await ensureContentFile();
  await writeContent(JSON.parse(JSON.stringify(DEFAULT_CONTENT)));

  server = app.listen(0);
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

async function request(path, { method = 'GET', body, ip = '203.0.113.10' } = {}) {
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

test('public content endpoints rate limit after the configured threshold', async () => {
  const first = await request('/api/content/events');
  const second = await request('/api/content/events');
  const third = await request('/api/content/events');

  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal(third.status, 429);

  const payload = await third.json();
  assert.match(payload.error, /Too many content requests/i);
});

test('admin login rate limits separately from content routes', async () => {
  const loginBody = {
    username: 'wrong-user',
    password: 'wrong-password',
  };

  const first = await request('/api/admin/login', { method: 'POST', body: loginBody, ip: '203.0.113.20' });
  const second = await request('/api/admin/login', { method: 'POST', body: loginBody, ip: '203.0.113.20' });
  const third = await request('/api/admin/login', { method: 'POST', body: loginBody, ip: '203.0.113.20' });

  assert.equal(first.status, 401);
  assert.equal(second.status, 401);
  assert.equal(third.status, 429);
});