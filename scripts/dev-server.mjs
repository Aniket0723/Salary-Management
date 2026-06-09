import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { loadLocalEnv } from './env.mjs';

loadLocalEnv();

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const frontendDir = path.join(rootDir, 'frontend');

const apiRoutes = {
  '/api/analytics': () => import('../backend/api/analytics.js'),
  '/api/employees': () => import('../backend/api/employees.js'),
  '/api/filters': () => import('../backend/api/filters.js'),
  '/api/seed': () => import('../backend/api/seed.js'),
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on('data', chunk => chunks.push(chunk));
    req.on('error', reject);
    req.on('end', () => {
      if (!chunks.length) return resolve({});

      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});

      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON request body'));
      }
    });
  });
}

function patchResponse(res) {
  res.status = statusCode => {
    res.statusCode = statusCode;
    return res;
  };
  res.json = body => {
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
    }
    res.end(JSON.stringify(body));
  };
  return res;
}

async function handleApi(req, res, url) {
  const loader = apiRoutes[url.pathname];
  if (!loader) return false;

  try {
    const body = await readBody(req);
    const mod = await loader();
    req.query = Object.fromEntries(url.searchParams.entries());
    req.body = body;
    await mod.default(req, patchResponse(res));
  } catch (err) {
    console.error('Local API error:', err);
    patchResponse(res).status(500).json({ error: err.message });
  }

  return true;
}

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
