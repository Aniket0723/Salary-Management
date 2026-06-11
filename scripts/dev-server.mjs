import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { loadLocalEnv } from './env.mjs';
import { handleApi } from './http-utils.mjs';

loadLocalEnv();

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const frontendDir = path.join(rootDir, 'frontend');

const port = Number(process.env.PORT || 5173);
const vite = await createViteServer({
  root: frontendDir,
  configFile: path.join(frontendDir, 'vite.config.ts'),
  server: { middlewareMode: true },
  appType: 'spa',
});

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || `localhost:${port}`}`);
  const handled = await handleApi(req, res, url);
  if (handled) return;

  vite.middlewares(req, res);
});

server.listen(port, () => {
  console.log(`Local app running at http://localhost:${port}`);
});
