import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createReq, createRes } from './helpers.js';
import analyticsHandler from '../api/analytics.js';
import filtersHandler from '../api/filters.js';
import { ensureDatabase, query } from '../db/client.js';

vi.mock('../db/client.js', () => ({
  ensureDatabase: vi.fn(),
  query: vi.fn(),
}));

describe('analytics API handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ensureDatabase.mockResolvedValue();
  });

  it('returns country, job, department, top earner, and overall analytics', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ country: 'India', count: 2, total_payroll: 100000, min_salary: 40000, max_salary: 60000, avg_salary: 50000 }] })
      .mockResolvedValueOnce({ rows: [{ job_title: 'Engineer', country: 'India', count: 2, avg_salary: 50000 }] })
      .mockResolvedValueOnce({ rows: [{ department: 'Engineering', count: 2, avg_salary: 50000, total_payroll: 100000 }] })
      .mockResolvedValueOnce({ rows: [{ id: 1, full_name: 'Jane Doe', salary: 60000 }] })
      .mockResolvedValueOnce({ rows: [{ total_employees: 2, total_payroll: 100000, min_salary: 40000, max_salary: 60000, avg_salary: 50000 }] });

    const req = createReq({ method: 'GET', query: { country: 'India', job_title: 'Engineer' } });
    const res = createRes();

    await analyticsHandler(req, res);

    expect(query).toHaveBeenCalledTimes(5);
    expect(query.mock.calls[0][1]).toEqual(['India', 'Engineer']);
    expect(res.statusCode).toBe(200);
    expect(res.body.overall.total_employees).toBe(2);
    expect(res.body.country_analytics[0].avg_salary).toBe(50000);
    expect(res.body.job_analytics[0]).toEqual({
      key: 'Engineer',
      job_title: 'Engineer',
      country: 'India',
      count: 2,
      avg_salary: 50000,
    });
    expect(res.body.department_analytics[0].department).toBe('Engineering');
    expect(res.body.top_earners[0].full_name).toBe('Jane Doe');
  });

  it('rejects unsupported methods', async () => {
    const req = createReq({ method: 'POST' });
    const res = createRes();

    await analyticsHandler(req, res);

    expect(query).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(405);
    expect(res.body.error).toBe('Method not allowed');
  });
});

describe('filters API handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ensureDatabase.mockResolvedValue();
  });

  it('returns distinct filter options', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ country: 'India' }, { country: 'USA' }] })
      .mockResolvedValueOnce({ rows: [{ job_title: 'Engineer' }] })
      .mockResolvedValueOnce({ rows: [{ department: 'Engineering' }] });

    const req = createReq({ method: 'GET' });
    const res = createRes();

    await filtersHandler(req, res);

    expect(query).toHaveBeenCalledTimes(3);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      countries: ['India', 'USA'],
      job_titles: ['Engineer'],
      departments: ['Engineering'],
    });
  });
});
