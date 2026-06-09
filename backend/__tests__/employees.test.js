import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createReq, createRes } from './helpers.js';
import handler from '../api/employees.js';
import { ensureDatabase, query } from '../db/client.js';

vi.mock('../db/client.js', () => ({
  ensureDatabase: vi.fn(),
  query: vi.fn(),
}));

const employee = {
  id: 1,
  employee_code: 'ACME-00001',
  full_name: 'Jane Doe',
  email: 'jane.doe@acme.example',
  job_title: 'Software Engineer',
  country: 'India',
  salary: 100000,
  department: 'Engineering',
  employment_type: 'Full-time',
  currency: 'USD',
  hire_date: '2024-01-15',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

describe('employees API handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ensureDatabase.mockResolvedValue();
  });

  it('returns filtered and paginated employees', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ count: 1 }] })
      .mockResolvedValueOnce({ rows: [employee] });

    const req = createReq({
      method: 'GET',
      query: {
        page: '2',
        limit: '25',
        search: 'Jane',
        country: 'India',
        job_title: 'Software Engineer',
        sort_by: 'salary',
        sort_order: 'desc',
      },
    });
    const res = createRes();

    await handler(req, res);

    expect(ensureDatabase).toHaveBeenCalledOnce();
    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[1][0]).toContain('ORDER BY salary DESC');
    expect(query.mock.calls[1][1]).toEqual([
        '%Jane%',
        'India',
        'Software Engineer',
      25,
      25,
    ]);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      data: [employee],
      count: 1,
      page: 2,
      limit: 25,
      total_pages: 1,
    });
  });

  it('returns one employee by route id', async () => {
    query.mockResolvedValueOnce({ rows: [employee] });

    const req = createReq({ method: 'GET', params: { id: '1' } });
    const res = createRes();

    await handler(req, res);

    expect(query).toHaveBeenCalledWith(expect.stringContaining('WHERE id = $1'), [1]);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(employee);
  });

  it('rejects create requests missing required fields', async () => {
    const req = createReq({
      method: 'POST',
      body: { full_name: 'Jane Doe', country: 'India', salary: 100000 },
    });
    const res = createRes();

    await handler(req, res);

    expect(query).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('employee_code');
  });

  it('rejects invalid create payloads before SQL runs', async () => {
    const req = createReq({
      method: 'POST',
      body: {
        employee_code: 'ACME-00001',
        full_name: 'Jane Doe',
        email: 'not-an-email',
        job_title: 'Software Engineer',
        country: 'India',
        salary: 0,
        hire_date: '15-01-2024',
      },
    });
    const res = createRes();

    await handler(req, res);

    expect(query).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('email');
    expect(res.body.error).toContain('salary');
    expect(res.body.error).toContain('hire_date');
  });

  it('creates an employee with parameterized SQL', async () => {
    query.mockResolvedValueOnce({ rows: [employee] });

    const req = createReq({
      method: 'POST',
      body: {
        employee_code: 'ACME-00001',
        full_name: 'Jane Doe',
        email: 'jane.doe@acme.example',
        job_title: 'Software Engineer',
        country: 'India',
        salary: '100000',
        department: 'Engineering',
        employment_type: 'Full-time',
        currency: 'USD',
        hire_date: '2024-01-15',
      },
    });
    const res = createRes();

    await handler(req, res);

    expect(query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO employees'), [
      'ACME-00001',
      'Jane Doe',
      'jane.doe@acme.example',
      'Software Engineer',
      'India',
      100000,
      'Engineering',
      'Full-time',
      'USD',
      '2024-01-15',
    ]);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(employee);
  });

  it('returns 404 when deleting a missing employee', async () => {
    query.mockResolvedValueOnce({ rows: [] });

    const req = createReq({ method: 'DELETE', params: { id: '999' } });
    const res = createRes();

    await handler(req, res);

    expect(query).toHaveBeenCalledWith('DELETE FROM employees WHERE id = $1 RETURNING id', [999]);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Employee not found');
  });
});
