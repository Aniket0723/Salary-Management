import { ensureDatabase, query } from '../db/client.js';

const SORT_COLUMNS = new Set([
  'id',
  'full_name',
  'job_title',
  'country',
  'salary',
  'department',
  'employment_type',
  'currency',
  'created_at',
]);

function jsonError(res, status, message) {
  return res.status(status).json({ error: message });
}

function buildWhere({ search = '', country = '', job_title = '' }) {
  const clauses = [];
  const values = [];

  if (search) {
    values.push(`%${search}%`);
    clauses.push(`(full_name ILIKE $${values.length} OR job_title ILIKE $${values.length} OR department ILIKE $${values.length})`);
  }
  if (country) {
    values.push(country);
    clauses.push(`country = $${values.length}`);
  }
  if (job_title) {
    values.push(job_title);
    clauses.push(`job_title = $${values.length}`);
  }

  return {
    whereSql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    values,
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    await ensureDatabase();

    if (req.method === 'GET') {
      const {
        page = '1',
        limit = '50',
        search = '',
        country = '',
        job_title = '',
        sort_by = 'id',
        sort_order = 'asc',
      } = req.query;

      const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 50));
      const offset = (pageNum - 1) * limitNum;
      const sortColumn = SORT_COLUMNS.has(sort_by) ? sort_by : 'id';
      const sortDirection = sort_order === 'desc' ? 'DESC' : 'ASC';
      const { whereSql, values } = buildWhere({ search, country, job_title });

      const countResult = await query(`SELECT COUNT(*)::int AS count FROM employees ${whereSql}`, values);
      const dataResult = await query(
        `
          SELECT id, full_name, job_title, country, salary, department, employment_type, currency, created_at
          FROM employees
          ${whereSql}
          ORDER BY ${sortColumn} ${sortDirection}
          LIMIT $${values.length + 1}
          OFFSET $${values.length + 2}
        `,
        [...values, limitNum, offset],
      );

      const count = countResult.rows[0]?.count ?? 0;
      return res.status(200).json({
        data: dataResult.rows,
        count,
        page: pageNum,
        limit: limitNum,
        total_pages: Math.ceil(count / limitNum),
      });
    }

    if (req.method === 'POST') {
      const { full_name, job_title, country, salary, department, employment_type, currency = 'USD' } = req.body;
      if (!full_name || !job_title || !country || salary == null) {
        return jsonError(res, 400, 'Missing required fields: full_name, job_title, country, salary');
      }

      const result = await query(
        `
          INSERT INTO employees (full_name, job_title, country, salary, department, employment_type, currency)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id, full_name, job_title, country, salary, department, employment_type, currency, created_at
        `,
        [full_name, job_title, country, Number(salary), department || null, employment_type || null, currency || 'USD'],
      );
      return res.status(201).json(result.rows[0]);
    }

    if (req.method === 'PUT') {
      const { id, full_name, job_title, country, salary, department, employment_type, currency } = req.body;
      if (!id) return jsonError(res, 400, 'Missing id');

      const fields = { full_name, job_title, country, salary, department, employment_type, currency };
      const assignments = [];
      const values = [];

      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined) {
          values.push(key === 'salary' ? Number(value) : value);
          assignments.push(`${key} = $${values.length}`);
        }
      }

      if (!assignments.length) return jsonError(res, 400, 'No fields to update');

      values.push(Number(id));
      const result = await query(
        `
          UPDATE employees
          SET ${assignments.join(', ')}
          WHERE id = $${values.length}
          RETURNING id, full_name, job_title, country, salary, department, employment_type, currency, created_at
        `,
        values,
      );

      if (!result.rows[0]) return jsonError(res, 404, 'Employee not found');
      return res.status(200).json(result.rows[0]);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return jsonError(res, 400, 'Missing id');

      const result = await query('DELETE FROM employees WHERE id = $1 RETURNING id', [Number(id)]);
      if (!result.rows[0]) return jsonError(res, 404, 'Employee not found');
      return res.status(200).json({ ok: true });
    }

    return jsonError(res, 405, 'Method not allowed');
  } catch (err) {
    console.error('Employees API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
