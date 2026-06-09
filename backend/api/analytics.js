import { ensureDatabase, query } from '../db/client.js';

function buildWhere({ country = '', job_title = '' }) {
  const clauses = [];
  const values = [];

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await ensureDatabase();

    const { country = '', job_title = '' } = req.query;
    const { whereSql, values } = buildWhere({ country, job_title });

    const [countryStats, jobStats, deptStats, topEarners, overall] = await Promise.all([
      query(
        `
          SELECT
            country,
            COUNT(*)::int AS count,
            COALESCE(SUM(salary), 0)::int AS total_payroll,
            COALESCE(MIN(salary), 0)::int AS min_salary,
            COALESCE(MAX(salary), 0)::int AS max_salary,
            COALESCE(ROUND(AVG(salary)), 0)::int AS avg_salary
          FROM employees
          ${whereSql}
          GROUP BY country
          ORDER BY avg_salary DESC
        `,
        values,
      ),
      query(
        `
          SELECT
            job_title,
            country,
            COUNT(*)::int AS count,
            COALESCE(ROUND(AVG(salary)), 0)::int AS avg_salary
          FROM employees
          ${whereSql}
          GROUP BY job_title, country
          ORDER BY avg_salary DESC
        `,
        values,
      ),
      query(
        `
          SELECT
            department,
            COUNT(*)::int AS count,
            COALESCE(ROUND(AVG(salary)), 0)::int AS avg_salary,
            COALESCE(SUM(salary), 0)::int AS total_payroll
          FROM employees
          ${whereSql}
          GROUP BY department
          ORDER BY avg_salary DESC
        `,
        values,
      ),
      query(
        `
          SELECT id, employee_code, full_name, email, job_title, country, salary, department, employment_type, currency, hire_date, created_at, updated_at
          FROM employees
          ${whereSql}
          ORDER BY salary DESC
          LIMIT 10
        `,
        values,
      ),
      query(
        `
          SELECT
            COUNT(*)::int AS total_employees,
            COALESCE(SUM(salary), 0)::int AS total_payroll,
            COALESCE(MIN(salary), 0)::int AS min_salary,
            COALESCE(MAX(salary), 0)::int AS max_salary,
            COALESCE(ROUND(AVG(salary)), 0)::int AS avg_salary
          FROM employees
          ${whereSql}
        `,
        values,
      ),
    ]);

    return res.status(200).json({
      overall: overall.rows[0],
      country_analytics: countryStats.rows,
      job_analytics: jobStats.rows.map(row => ({
        key: country ? row.job_title : `${row.job_title} | ${row.country}`,
        ...row,
      })),
      department_analytics: deptStats.rows,
      top_earners: topEarners.rows,
    });
  } catch (err) {
    console.error('Analytics API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
