import { ensureDatabase, query } from '../db/client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await ensureDatabase();

    const [countries, jobs, depts] = await Promise.all([
      query("SELECT DISTINCT country FROM employees WHERE country IS NOT NULL AND country <> '' ORDER BY country"),
      query("SELECT DISTINCT job_title FROM employees WHERE job_title IS NOT NULL AND job_title <> '' ORDER BY job_title"),
      query("SELECT DISTINCT department FROM employees WHERE department IS NOT NULL AND department <> '' ORDER BY department"),
    ]);

    return res.status(200).json({
      countries: countries.rows.map(row => row.country),
      job_titles: jobs.rows.map(row => row.job_title),
      departments: depts.rows.map(row => row.department),
    });
  } catch (err) {
    console.error('Filters API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
