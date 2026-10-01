import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleContact } from './contact.js';
import { handleProjects } from './projects.js';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const distRoot = resolve(projectRoot, 'dist');
const envFile = resolve(projectRoot, '.env');
if (existsSync(envFile)) process.loadEnvFile(envFile);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  if (pathname === '/api/contact') {
    await handleContact(request, response);
    return;
  }
  if (pathname === '/api/projects') {
    await handleProjects(request, response);
    return;
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  let path;
  try {
    const decoded = decodeURIComponent(pathname);
    if (decoded.split('/').some((segment) => segment.startsWith('.'))) {
      response.writeHead(404).end('Not found');
      return;
    }
    path = resolve(distRoot, pathname === '/' ? 'index.html' : `.${decoded}`);
  } catch {
    response.writeHead(400).end();
    return;
  }
  if (path !== distRoot && !path.startsWith(distRoot + sep)) {
    response.writeHead(403).end();
    return;
  }

  try {
    let contents;
    try {
      contents = await readFile(path);
    } catch (error) {
      if (error.code !== 'ENOENT' || extname(pathname)) throw error;
      path = resolve(distRoot, 'index.html');
      contents = await readFile(path);
    }
    response.writeHead(200, { 'Content-Type': contentTypes[extname(path)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : contents);
  } catch {
    response.writeHead(404).end('Not found');
  }
});

const port = Number(process.env.PORT || 8787);
server.listen(port, () => console.log(`Portfolio server listening on http://localhost:${port}`));
