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
  }]);
});

test('keeps projects when repository cells are missing, null, empty, or present', () => {
  const repositoryValues = [undefined, null, '', '   ', ' https://github.com/example/project '];
  const rows = repositoryValues.map((value, index) => ({
    id: `row-${index}`,
    cells: {
      Title: { value: `Project ${index}` },
      ...(value === undefined ? {} : { 'Repository Link': { value } }),
    },
  }));
  const projects = mapProjectRows(rows);
  assert.equal(projects.length, rows.length);
  assert.ok(projects.every((project) => !Object.hasOwn(project, 'repoUrl')));
});

test('skips malformed rows while keeping valid projects and safe links', () => {
  const projects = mapProjectRows([
    null,
    { id: 'missing-title', cells: { 'Repository Link': { value: 'https://github.com/example/old' } } },
    { id: 'valid', cells: {
      Title: { value: 'Current project' },
      'Repository Link': { value: 'javascript:alert(1)' },
      'Live Demo Link': { value: 'https://example.com/demo' },
      Technologies: { value: 'React, , Node.js' },
    } },
  ]);
  assert.equal(projects.length, 1);
  assert.equal(Object.hasOwn(projects[0], 'repoUrl'), false);
  assert.equal(projects[0].liveUrl, 'https://example.com/demo');
  assert.deepEqual(projects[0].technologies, ['React', 'Node.js']);
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

test('treats malformed upstream JSON as an upstream failure', async () => {
  const env = { FRUITASK_API_KEY: 'test-only-key', FRUITASK_PROJECTS_WORKSPACE_TOKEN: 'test-only-token' };
  await assert.rejects(loadProjects(env, async () => ({ ok: true, json: async () => ({ data: {} }) })),
    (error) => error instanceof ProjectsError && error.status === 502);
  await assert.rejects(loadProjects(env, async () => ({ ok: true, json: async () => { throw new SyntaxError('bad JSON'); } })),
    (error) => error instanceof ProjectsError && error.status === 502);
});

test('reports upstream HTTP and network failures without returning credentials', async () => {
  const env = { FRUITASK_API_KEY: 'test-only-key', FRUITASK_PROJECTS_WORKSPACE_TOKEN: 'test-only-token' };
  for (const fetchRequest of [
    async () => ({ ok: false, status: 500 }),
    async () => { throw new Error('network failure'); },
  ]) {
    await assert.rejects(loadProjects(env, fetchRequest), (error) =>
      error instanceof ProjectsError && error.status === 502 && !error.message.includes(env.FRUITASK_API_KEY));
  }
});
