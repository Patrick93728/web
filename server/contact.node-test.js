import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { afterEach, test } from 'node:test';
import { handleContact } from './contact.js';

const values = {
  name: 'Pat Example',
  email: 'pat@example.com',
  subject: 'Website Development',
  message: 'A small website with booking.',
};
const env = {
  FRUITASK_API_KEY: 'test-only-key',
  FRUITASK_WORKSPACE_TOKEN: 'test-only-token',
  FRUITASK_TABLE_NAME: 'Table 1',
};
const servers = [];

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise((resolve) => server.close(resolve))));
});

async function request(body, options = {}) {
  const server = createServer((req, res) => handleContact(req, res, options));
  servers.push(server);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: response.status, body: await response.json() };
}

test('sends validated inquiry through the server with secrets only in the Fruitask request', async () => {
  let outgoing;
  const result = await request(values, {
    env,
    fetchRequest: async (url, init) => {
      outgoing = { url, ...init };
      return { ok: true };
    },
  });

  assert.deepEqual(result, { status: 201, body: { success: true } });
  assert.equal(outgoing.method, 'POST');
  assert.equal(outgoing.headers['X-API-Key'], env.FRUITASK_API_KEY);
  assert.equal(outgoing.url, 'https://integrations.fruitask.com/Table%201/test-only-token/rows');
  assert.deepEqual(JSON.parse(outgoing.body).cells, {
    Name: values.name,
    Email: values.email,
    Subject: values.subject,
    Message: values.message,
  });
  assert.equal(JSON.stringify(result).includes(env.FRUITASK_API_KEY), false);
  assert.equal(JSON.stringify(result).includes(env.FRUITASK_WORKSPACE_TOKEN), false);
});

test('rejects missing fields before calling Fruitask', async () => {
  let called = false;
  const result = await request({ ...values, message: '' }, {
    env,
    fetchRequest: async () => { called = true; return { ok: true }; },
  });
  assert.equal(result.status, 400);
  assert.equal(called, false);
});

test('reports missing configuration and upstream errors without exposing credentials', async () => {
  const unconfigured = await request(values, { env: {} });
  assert.equal(unconfigured.status, 503);

  const failed = await request(values, { env, fetchRequest: async () => ({ ok: false, status: 401 }) });
  assert.equal(failed.status, 502);
  assert.equal(JSON.stringify(failed).includes(env.FRUITASK_API_KEY), false);
  assert.equal(JSON.stringify(failed).includes(env.FRUITASK_WORKSPACE_TOKEN), false);
});
