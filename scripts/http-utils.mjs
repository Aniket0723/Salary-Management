const apiRoutes = {
  '/api/analytics': () => import('../backend/api/analytics.js'),
  '/api/employees': () => import('../backend/api/employees.js'),
  '/api/filters': () => import('../backend/api/filters.js'),
  '/api/seed': () => import('../backend/api/seed.js'),
};

function matchApiRoute(pathname) {
  if (apiRoutes[pathname]) {
    return { loader: apiRoutes[pathname], params: {} };
  }

  const employeeMatch = pathname.match(/^\/api\/employees\/(\d+)$/);
  if (employeeMatch) {
    return {
      loader: apiRoutes['/api/employees'],
      params: { id: employeeMatch[1] },
    };
  }

  return null;
}

export function readBody(req) {
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

export function patchResponse(res) {
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

export async function handleApi(req, res, url) {
  const match = matchApiRoute(url.pathname);
  if (!match) return false;

  try {
    const body = await readBody(req);
    const mod = await match.loader();
    req.query = Object.fromEntries(url.searchParams.entries());
    req.body = body;
    req.params = match.params;
    await mod.default(req, patchResponse(res));
  } catch (err) {
    console.error('API error:', err);
    patchResponse(res).status(500).json({ error: err.message });
  }

  return true;
}
