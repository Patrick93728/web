import assert from 'node:assert/strict';
import { test } from 'node:test';
import worker from './index.js';

const env = {
  FRUITASK_API_KEY: 'test-only-key',
  FRUITASK_WORKSPACE_TOKEN: 'test-only-token',
  FRUITASK_TABLE_NAME: 'Table 1',
  FRUITASK_PROJECTS_WORKSPACE_TOKEN: 'test-projects-token',
  ASSETS: { fetch: async () => new Response('portfolio asset') },
};

test('serves static assets and keeps unknown API paths out of the SPA', async () => {
  const asset = await worker.fetch(new Request('https://example.com/'), env);
  assert.equal(await asset.text(), 'portfolio asset');

  const missing = await worker.fetch(new Request('https://example.com/api/missing'), env);
  assert.equal(missing.status, 404);
});

test('validates and forwards contact inquiries with server-only credentials', async () => {
  const originalFetch = globalThis.fetch;
  let outgoing;
  globalThis.fetch = async (url, init) => {
    outgoing = { url, ...init };
    return new Response('{}', { status: 201 });
  };
  try {
    const request = new Request('https://example.com/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Pat Example', email: 'pat@example.com', subject: 'Website Development', message: 'A booking site.' }),
    });
    const response = await worker.fetch(request, env);
    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), { success: true });
    assert.equal(outgoing.headers['X-API-Key'], env.FRUITASK_API_KEY);
    assert.deepEqual(JSON.parse(outgoing.body).cells, {
      Name: 'Pat Example', Email: 'pat@example.com', Subject: 'Website Development', Message: 'A booking site.',
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('rejects invalid and unsupported contact requests', async () => {
  const get = await worker.fetch(new Request('https://example.com/api/contact'), env);
  assert.equal(get.status, 405);
  assert.equal(get.headers.get('Allow'), 'POST');

  const invalid = await worker.fetch(new Request('https://example.com/api/contact', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
  }), env);
  assert.equal(invalid.status, 400);
});

test('serves Projects through the Worker without exposing API credentials', async () => {
  const originalFetch = globalThis.fetch;
  let outgoing;
  globalThis.fetch = async (url, init) => {
    outgoing = { url, ...init };
    return Response.json({ data: { rows: [{ id: 'row-1', cells: { Title: { value: 'Attendly' } } }] } });
  };
  try {
    const response = await worker.fetch(new Request('https://example.com/api/projects'), env);
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.projects[0].title, 'Attendly');
    assert.equal(outgoing.headers['X-API-Key'], env.FRUITASK_API_KEY);
    assert.equal(JSON.stringify(result).includes(env.FRUITASK_API_KEY), false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('returns 200 with projects that have no repository cell', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ data: { rows: [
    { id: 'with-repo', cells: { Title: { value: 'With repository' }, 'Repository Link': { value: 'https://github.com/example/project' } } },
    { id: 'without-repo', cells: { Title: { value: 'Without repository' } } },
  ] } });
  try {
    const response = await worker.fetch(new Request('https://example.com/api/projects'), env);
    assert.equal(response.status, 200);
    const { projects } = await response.json();
    assert.equal(projects.length, 2);
    assert.ok(projects.every((project) => !Object.hasOwn(project, 'repoUrl')));
  } finally {
    globalThis.fetch = originalFetch;
  }
});
