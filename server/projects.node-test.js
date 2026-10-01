import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadProjects, mapProjectRows, ProjectsError } from './projects.js';

const row = {
  id: 'row-1',
  cells: {
    Title: { value: 'Attendly' },
    Description: { value: 'A QR attendance tracker.' },
    Technologies: { value: 'Flutter, Dart' },
    image: { value: [{ url: 'https://example.com/attendly.png' }] },
    'Live Demo Link': { value: 'https://example.com/demo' },
  },
};

test('maps only project display fields from Fruitask rows', () => {
  assert.deepEqual(mapProjectRows([row]), [{
    id: 'row-1',
    title: 'Attendly',
    summary: 'A QR attendance tracker.',
    category: 'Development',
    status: 'Completed',
    role: null,
    technologies: ['Flutter', 'Dart'],
    images: ['https://example.com/attendly.png'],
    image: 'https://example.com/attendly.png',
    liveUrl: 'https://example.com/demo',
    repoUrl: null,
  }]);
});

test('fetches project rows with server-only credentials', async () => {
  let outgoing;
  const projects = await loadProjects({
    FRUITASK_API_KEY: 'test-only-key',
    FRUITASK_PROJECTS_WORKSPACE_TOKEN: 'test-only-token',
  }, async (url, init) => {
    outgoing = { url, ...init };
    return { ok: true, json: async () => ({ data: { rows: [row] } }) };
  });
  assert.equal(outgoing.url, 'https://integrations.fruitask.com/Projects/test-only-token/rows');
  assert.equal(outgoing.headers['X-API-Key'], 'test-only-key');
  assert.equal(projects[0].title, 'Attendly');
  assert.equal(JSON.stringify(projects).includes('test-only-key'), false);
});

test('reports missing project credentials without exposing values', async () => {
  await assert.rejects(loadProjects({}), (error) => error instanceof ProjectsError && error.status === 503);
});
