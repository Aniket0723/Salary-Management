import { loadLocalEnv } from './env.mjs';

loadLocalEnv();

const { seedEmployees } = await import('../backend/seed/employees.js');
const args = process.argv.slice(2);
const mode = args.includes('--append') ? 'append' : 'reset';
const count = args.find(arg => /^\d+$/.test(arg)) || 10000;

try {
  const result = await seedEmployees(count, { mode });
  console.log(result.message);
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exitCode = 1;
}
