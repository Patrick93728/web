import { ContactError, saveContact, validateContact } from '../server/contact.js';
import { loadProjects, ProjectsError } from '../server/projects.js';

const MAX_BODY_BYTES = 16_384;
const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };

function jsonResponse(status, body, extraHeaders = {}) {
  return Response.json(body, { status, headers: { ...headers, ...extraHeaders } });
}

async function readContactBody(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new ContactError(400, 'Enter your project details and try again.');

  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new ContactError(413, 'The inquiry is too large.');
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new ContactError(400, 'Enter your project details and try again.');
  }
}

export default {
  async fetch(request, env) {
    const pathname = new URL(request.url).pathname;
    if (pathname === '/api/projects') {
      if (request.method !== 'GET') return jsonResponse(405, { error: 'Method not allowed.' }, { Allow: 'GET' });
      try {
        return jsonResponse(200, { projects: await loadProjects(env) });
      } catch (error) {
        return jsonResponse(error instanceof ProjectsError ? error.status : 500, { error: 'Project data is unavailable.' });
      }
    }
    if (pathname !== '/api/contact') {
      if (pathname.startsWith('/api/')) return jsonResponse(404, { error: 'Not found.' });
      return env.ASSETS.fetch(request);
    }

    if (request.method !== 'POST') return jsonResponse(405, { error: 'Method not allowed.' }, { Allow: 'POST' });
    if (!request.headers.get('content-type')?.startsWith('application/json')) {
      return jsonResponse(415, { error: 'Send the inquiry as JSON.' });
    }

    try {
      const values = validateContact(await readContactBody(request));
      await saveContact(values, env);
      return jsonResponse(201, { success: true });
    } catch (error) {
      const status = error instanceof ContactError ? error.status : 500;
      const message = error instanceof ContactError ? error.message : 'The inquiry could not be sent. Please try again.';
      return jsonResponse(status, { error: message });
    }
  },
};
