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
          employee_code TEXT,
          full_name TEXT NOT NULL,
          email TEXT,
          job_title TEXT NOT NULL,
          country TEXT NOT NULL,
          salary INTEGER NOT NULL CHECK (salary >= 0),
          department TEXT,
          employment_type TEXT,
          currency TEXT NOT NULL DEFAULT 'USD',
          hire_date DATE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await query('ALTER TABLE employees ADD COLUMN IF NOT EXISTS employee_code TEXT');
      await query('ALTER TABLE employees ADD COLUMN IF NOT EXISTS email TEXT');
      await query('ALTER TABLE employees ADD COLUMN IF NOT EXISTS hire_date DATE');
      await query('ALTER TABLE employees ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()');
      await query(`
        UPDATE employees
        SET
          employee_code = COALESCE(employee_code, 'ACME-' || LPAD(id::text, 5, '0')),
          email = COALESCE(email, LOWER(REGEXP_REPLACE(full_name, '[^a-zA-Z0-9]+', '.', 'g')) || id::text || '@acme.example'),
          hire_date = COALESCE(hire_date, created_at::date),
          updated_at = COALESCE(updated_at, created_at)
      `);
      await query('CREATE INDEX IF NOT EXISTS employees_country_idx ON employees (country)');
      await query('CREATE INDEX IF NOT EXISTS employees_job_title_idx ON employees (job_title)');
      await query('CREATE INDEX IF NOT EXISTS employees_country_job_title_idx ON employees (country, job_title)');
      await query('CREATE INDEX IF NOT EXISTS employees_salary_idx ON employees (salary DESC)');
      await query('CREATE INDEX IF NOT EXISTS employees_full_name_idx ON employees (full_name)');
      await query('CREATE UNIQUE INDEX IF NOT EXISTS employees_employee_code_idx ON employees (employee_code)');
      await query('CREATE UNIQUE INDEX IF NOT EXISTS employees_email_idx ON employees (email)');
    })();
  }
  return schemaReady;
}

export async function closePool() {
  await pool.end();
}
