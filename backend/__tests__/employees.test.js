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
  full_name: 'Jane Doe',
  job_title: 'Software Engineer',
  country: 'India',
  salary: 100000,
  department: 'Engineering',
  employment_type: 'Full-time',
  currency: 'USD',
  created_at: '2026-01-01T00:00:00.000Z',
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

  it('rejects create requests missing required fields', async () => {
    const req = createReq({
      method: 'POST',
      body: { full_name: 'Jane Doe', country: 'India', salary: 100000 },
    });
    const res = createRes();

    await handler(req, res);

    expect(query).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('Missing required fields');
  });

  it('creates an employee with parameterized SQL', async () => {
    query.mockResolvedValueOnce({ rows: [employee] });

    const req = createReq({
      method: 'POST',
      body: {
        full_name: 'Jane Doe',
        job_title: 'Software Engineer',
        country: 'India',
        salary: '100000',
        department: 'Engineering',
        employment_type: 'Full-time',
        currency: 'USD',
      },
    });
    const res = createRes();

    await handler(req, res);

    expect(query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO employees'), [
      'Jane Doe',
      'Software Engineer',
      'India',
      100000,
      'Engineering',
      'Full-time',
      'USD',
    ]);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(employee);
  });

  it('returns 404 when deleting a missing employee', async () => {
    query.mockResolvedValueOnce({ rows: [] });

    const req = createReq({ method: 'DELETE', body: { id: 999 } });
    const res = createRes();

    await handler(req, res);

    expect(query).toHaveBeenCalledWith('DELETE FROM employees WHERE id = $1 RETURNING id', [999]);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Employee not found');
  });
});
