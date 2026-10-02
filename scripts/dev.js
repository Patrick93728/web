import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const serverPath = fileURLToPath(new URL('../server/index.js', import.meta.url));
const vitePath = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url));
const api = spawn(process.execPath, [serverPath], { stdio: 'inherit', env: { ...process.env, PORT: '8787', PORTFOLIO_API_HOST: '127.0.0.1' } });
const vite = spawn(process.execPath, [vitePath, '--host', '127.0.0.1'], { stdio: 'inherit' });

function stop() {
  api.kill();
  vite.kill();
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
api.on('exit', (code) => { vite.kill(); process.exitCode = code || 1; });
vite.on('exit', (code) => { api.kill(); process.exitCode = code || 1; });
