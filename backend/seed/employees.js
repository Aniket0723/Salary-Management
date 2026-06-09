import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureDatabase, getClient } from '../db/client.js';

const seedDir = path.dirname(fileURLToPath(import.meta.url));

function readNames(fileName) {
  return fs
    .readFileSync(path.join(seedDir, 'data', fileName), 'utf8')
    .split(/\r?\n/)
    .map(name => name.trim())
    .filter(Boolean);
}

const FIRST_NAMES = readNames('first_names.txt');
const LAST_NAMES = readNames('last_names.txt');

const JOB_TITLES = [
  'Software Engineer','Product Manager','Data Analyst','UX Designer','Sales Representative',
  'Marketing Manager','HR Specialist','Financial Analyst','Operations Manager','Customer Success Manager',
  'DevOps Engineer','Business Analyst','Account Executive','Content Strategist','Legal Counsel',
];

const COUNTRIES = ['USA','UK','Germany','India','Canada','Australia','Singapore','Netherlands','France','Japan'];
const DEPARTMENTS = ['Engineering','Product','Sales','Marketing','Operations'];
const EMPLOYMENT_TYPES = ['Full-time','Contract','Part-time'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomHireDate() {
  const start = new Date('2017-01-01T00:00:00.000Z').getTime();
  const end = new Date('2026-01-01T00:00:00.000Z').getTime();
  return new Date(randomInt(start, end)).toISOString().slice(0, 10);
}

function emailFromName(first, last, sequence) {
  return `${first}.${last}.${sequence}@acme.example`.toLowerCase().replace(/[^a-z0-9@.]+/g, '');
}

function generateEmployee(sequence) {
  const first = FIRST_NAMES[randomInt(0, FIRST_NAMES.length - 1)];
  const last = LAST_NAMES[randomInt(0, LAST_NAMES.length - 1)];
  const country = COUNTRIES[randomInt(0, COUNTRIES.length - 1)];
  const job = JOB_TITLES[randomInt(0, JOB_TITLES.length - 1)];
  const dept = DEPARTMENTS[randomInt(0, DEPARTMENTS.length - 1)];
  const empType = EMPLOYMENT_TYPES[randomInt(0, EMPLOYMENT_TYPES.length - 1)];

  const baseSalary = {
    'Software Engineer': 120000, 'DevOps Engineer': 125000, 'Data Analyst': 95000,
    'Product Manager': 130000, 'UX Designer': 105000, 'Sales Representative': 85000,
    'Marketing Manager': 110000, 'HR Specialist': 75000, 'Financial Analyst': 100000,
    'Operations Manager': 115000, 'Customer Success Manager': 90000, 'Business Analyst': 98000,
    'Account Executive': 95000, 'Content Strategist': 88000, 'Legal Counsel': 140000,
  }[job] || 90000;

  const countryMultiplier = {
    'USA': 1.0, 'UK': 0.75, 'Germany': 0.78, 'India': 0.25, 'Canada': 0.82,
    'Australia': 0.85, 'Singapore': 0.72, 'Netherlands': 0.76, 'France': 0.70, 'Japan': 0.68,
  }[country] || 1.0;

  const salary = Math.round(baseSalary * countryMultiplier * (0.8 + Math.random() * 0.4));

  return {
    employee_code: `ACME-${String(sequence).padStart(5, '0')}`,
    full_name: `${first} ${last}`,
    email: emailFromName(first, last, sequence),
    job_title: job,
    country,
    salary,
    department: dept,
    employment_type: empType,
    currency: 'USD',
    hire_date: randomHireDate(),
  };
}

function buildInsert(batch) {
  const columns = ['employee_code', 'full_name', 'email', 'job_title', 'country', 'salary', 'department', 'employment_type', 'currency', 'hire_date'];
  const values = [];
  const rows = batch.map((employee, rowIndex) => {
    const placeholders = columns.map((column, columnIndex) => {
      values.push(employee[column]);
      return `$${rowIndex * columns.length + columnIndex + 1}`;
    });
    return `(${placeholders.join(', ')})`;
  });

  return {
    text: `
      INSERT INTO employees (${columns.join(', ')})
      VALUES ${rows.join(', ')}
    `,
    values,
  };
}

export async function seedEmployees(count = 10000, options = {}) {
  const targetCount = Math.min(20000, Math.max(1, Number.parseInt(count, 10) || 10000));
  const batchSize = 500;
  const batches = Math.ceil(targetCount / batchSize);
  const mode = options.mode === 'append' ? 'append' : 'reset';
  const client = await getClient();

  try {
    await ensureDatabase();
    await client.query('BEGIN');
    let baseSequence = 0;

    if (mode === 'reset') {
      await client.query('TRUNCATE TABLE employees RESTART IDENTITY');
    } else {
      const countResult = await client.query('SELECT COUNT(*)::int AS count FROM employees');
      baseSequence = countResult.rows[0]?.count ?? 0;
    }

    for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
      const start = batchIndex * batchSize;
      const end = Math.min(start + batchSize, targetCount);
      const batch = [];

      for (let i = start; i < end; i++) {
        batch.push(generateEmployee(baseSequence + i + 1));
      }

      const insert = buildInsert(batch);
      await client.query(insert.text, insert.values);
    }

    await client.query('COMMIT');
    return {
      mode,
      seeded: targetCount,
      message: mode === 'append'
        ? `Successfully appended ${targetCount} employees`
        : `Successfully reset and seeded ${targetCount} employees`,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
