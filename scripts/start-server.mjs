import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadLocalEnv } from './env.mjs';
import { handleApi } from './http-utils.mjs';

loadLocalEnv();

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist');
const port = Number(process.env.PORT || 10000);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
};

function isInsideDist(filePath) {
  const relative = path.relative(distDir, filePath);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

async function resolveStaticFile(pathname) {
  let decodedPathname;
  try {
    decodedPathname = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const requestedPath = path.normalize(path.join(distDir, decodedPathname));
  if (!isInsideDist(requestedPath)) return null;

  try {
    const stat = await fs.stat(requestedPath);
    if (stat.isFile()) return requestedPath;
  } catch {
    // Fall back to the SPA entry below.
  }

  return path.join(distDir, 'index.html');
}

async function sendStatic(req, res, pathname) {
  const filePath = await resolveStaticFile(pathname);
  if (!filePath) {
    res.statusCode = 400;
    res.end('Bad request');
    return;
  }

  try {
    const content = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    res.statusCode = 200;
    res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
    if (pathname.startsWith('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    res.end(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }
    console.error('Static file error:', err);
    res.statusCode = 500;
    res.end('Server error');
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || `localhost:${port}`}`);

  if (url.pathname === '/health') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  const handled = await handleApi(req, res, url);
  if (handled) return;

  await sendStatic(req, res, url.pathname);
});

server.listen(port, () => {
  console.log(`Production app running on port ${port}`);
});
