import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required. Add it to .env.local for local development.');
}

function getPoolConfig(rawConnectionString) {
  try {
    const url = new URL(rawConnectionString);
    const sslMode = url.searchParams.get('sslmode');
    const shouldUseSsl = Boolean(sslMode) || url.hostname.includes('neon.tech');

    url.searchParams.delete('sslmode');
    url.searchParams.delete('channel_binding');

    return {
      connectionString: url.toString(),
      ssl: shouldUseSsl ? { rejectUnauthorized: true } : undefined,
    };
  } catch {
    return {
      connectionString: rawConnectionString,
      ssl: rawConnectionString.includes('sslmode=require') ? { rejectUnauthorized: true } : undefined,
    };
  }
}

const pool = new Pool({
  ...getPoolConfig(connectionString),
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  allowExitOnIdle: true,
});

let schemaReady;

export async function query(text, params = []) {
  return pool.query(text, params);
}

export async function getClient() {
  return pool.connect();
}

export async function ensureDatabase() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await query(`
        CREATE TABLE IF NOT EXISTS employees (
          id SERIAL PRIMARY KEY,
          full_name TEXT NOT NULL,
          job_title TEXT NOT NULL,
          country TEXT NOT NULL,
          salary INTEGER NOT NULL CHECK (salary >= 0),
          department TEXT,
          employment_type TEXT,
          currency TEXT NOT NULL DEFAULT 'USD',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await query('CREATE INDEX IF NOT EXISTS employees_country_idx ON employees (country)');
      await query('CREATE INDEX IF NOT EXISTS employees_job_title_idx ON employees (job_title)');
      await query('CREATE INDEX IF NOT EXISTS employees_salary_idx ON employees (salary DESC)');
      await query('CREATE INDEX IF NOT EXISTS employees_full_name_idx ON employees (full_name)');
    })();
  }
  return schemaReady;
}

export async function closePool() {
  await pool.end();
}
