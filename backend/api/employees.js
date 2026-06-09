import { ensureDatabase, query } from '../db/client.js';
import { z } from 'zod';

const SORT_COLUMNS = new Set([
  'id',
  'employee_code',
  'full_name',
  'email',
  'job_title',
  'country',
  'salary',
  'department',
  'employment_type',
  'currency',
  'hire_date',
  'created_at',
  'updated_at',
]);

const EMPLOYEE_FIELDS = 'id, employee_code, full_name, email, job_title, country, salary, department, employment_type, currency, hire_date, created_at, updated_at';
const requiredText = z.string().trim().min(1);
const optionalText = z.preprocess(
  value => value === '' ? null : value,
  z.string().trim().min(1).nullable().optional(),
);
const hireDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'hire_date must use YYYY-MM-DD format');
const employeePayloadSchema = z.object({
  employee_code: requiredText.max(32),
  full_name: requiredText.max(120),
  email: z.string().trim().email().max(160),
  job_title: requiredText.max(120),
  country: requiredText.max(80),
  salary: z.coerce.number().int().positive(),
  department: optionalText,
  employment_type: z.enum(['Full-time', 'Contract', 'Part-time']).default('Full-time'),
  currency: requiredText.max(8).default('USD'),
  hire_date: hireDate,
});
const employeeUpdateSchema = employeePayloadSchema.partial().extend({
  id: z.coerce.number().int().positive(),
}).refine(
  data => Object.keys(data).some(key => key !== 'id' && data[key] !== undefined),
  'No fields to update',
);

function jsonError(res, status, message) {
  return res.status(status).json({ error: message });
}

function formatValidationError(result) {
  return result.error.issues.map(issue => {
    const field = issue.path.join('.') || 'employee';
    return `${field}: ${issue.message}`;
  }).join('; ');
}

function buildWhere({ search = '', country = '', job_title = '' }) {
  const clauses = [];
  const values = [];

  if (search) {
    values.push(`%${search}%`);
    clauses.push(`(employee_code ILIKE $${values.length} OR full_name ILIKE $${values.length} OR email ILIKE $${values.length} OR job_title ILIKE $${values.length} OR department ILIKE $${values.length})`);
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

function getRouteId(req) {
  return req.params?.id ?? req.body?.id;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    await ensureDatabase();

    if (req.method === 'GET') {
      if (req.params?.id) {
        const result = await query(
          `SELECT ${EMPLOYEE_FIELDS} FROM employees WHERE id = $1`,
          [Number(req.params.id)],
        );

        if (!result.rows[0]) return jsonError(res, 404, 'Employee not found');
        return res.status(200).json(result.rows[0]);
      }

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
          SELECT ${EMPLOYEE_FIELDS}
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
      const parsed = employeePayloadSchema.safeParse(req.body);
      if (!parsed.success) return jsonError(res, 400, formatValidationError(parsed));

      const { employee_code, full_name, email, job_title, country, salary, department, employment_type, currency, hire_date } = parsed.data;

      const result = await query(
        `
          INSERT INTO employees (employee_code, full_name, email, job_title, country, salary, department, employment_type, currency, hire_date)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING ${EMPLOYEE_FIELDS}
        `,
        [employee_code, full_name, email, job_title, country, Number(salary), department || null, employment_type || null, currency || 'USD', hire_date],
      );
      return res.status(201).json(result.rows[0]);
    }

    if (req.method === 'PUT') {
      const parsed = employeeUpdateSchema.safeParse({ ...req.body, id: getRouteId(req) });
      if (!parsed.success) return jsonError(res, 400, formatValidationError(parsed));

      const { id, employee_code, full_name, email, job_title, country, salary, department, employment_type, currency, hire_date } = parsed.data;
      const fields = { employee_code, full_name, email, job_title, country, salary, department, employment_type, currency, hire_date };
      const assignments = [];
      const values = [];

      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined) {
          values.push(key === 'salary' ? Number(value) : value);
          assignments.push(`${key} = $${values.length}`);
        }
      }
      values.push(Number(id));
      const result = await query(
        `
          UPDATE employees
          SET ${assignments.join(', ')}, updated_at = NOW()
          WHERE id = $${values.length}
          RETURNING ${EMPLOYEE_FIELDS}
        `,
        values,
      );

      if (!result.rows[0]) return jsonError(res, 404, 'Employee not found');
      return res.status(200).json(result.rows[0]);
    }

    if (req.method === 'DELETE') {
      const id = getRouteId(req);
      if (!id) return jsonError(res, 400, 'Missing id');

      const result = await query('DELETE FROM employees WHERE id = $1 RETURNING id', [Number(id)]);
      if (!result.rows[0]) return jsonError(res, 404, 'Employee not found');
      return res.status(200).json({ ok: true });
    }

    return jsonError(res, 405, 'Method not allowed');
  } catch (err) {
    if (err.code === '23505') {
      return jsonError(res, 409, 'Employee code or email already exists');
    }

    console.error('Employees API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
