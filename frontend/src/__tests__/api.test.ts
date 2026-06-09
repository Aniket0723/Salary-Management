import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

import { fetchEmployees, fetchEmployee, createEmployee, updateEmployee, deleteEmployee, fetchAnalytics, fetchFilters } from '../lib/api';

describe('API Client', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('fetchEmployee', () => {
    it('returns one employee by id', async () => {
      const mockEmployee = {
        id: 1,
        employee_code: 'ACME-00001',
        full_name: 'John Doe',
        email: 'john.doe@acme.example',
        job_title: 'Engineer',
        country: 'USA',
        salary: 100000,
        department: 'Engineering',
        employment_type: 'Full-time',
        currency: 'USD',
        hire_date: '2020-01-01',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockEmployee });

      const result = await fetchEmployee(1);
      expect(result.id).toBe(1);
      expect(mockFetch).toHaveBeenCalledWith('/api/employees/1');
    });
  });

  describe('fetchEmployees', () => {
    it('returns paginated employee data', async () => {
      const mockResponse = {
        data: [{
          id: 1,
          employee_code: 'ACME-00001',
          full_name: 'John Doe',
          email: 'john.doe@acme.example',
          job_title: 'Engineer',
          country: 'USA',
          salary: 100000,
          department: 'Engineering',
          employment_type: 'Full-time',
          currency: 'USD',
          hire_date: '2020-01-01',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        }],
        count: 1,
        page: 1,
        limit: 50,
        total_pages: 1,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetchEmployees({ page: 1, search: 'John' });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].full_name).toBe('John Doe');
      expect(mockFetch).toHaveBeenCalledWith('/api/employees?page=1&search=John');
    });

    it('throws on error response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, text: async () => 'Server error' });
      await expect(fetchEmployees()).rejects.toThrow();
    });
  });

  describe('createEmployee', () => {
    it('creates an employee and returns it', async () => {
      const newEmp = {
        employee_code: 'ACME-00002',
        full_name: 'Jane Doe',
        email: 'jane.doe@acme.example',
        job_title: 'Designer',
        country: 'UK',
        salary: 80000,
        department: 'Product',
        employment_type: 'Full-time',
        currency: 'USD',
        hire_date: '2021-01-01',
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 2, ...newEmp, created_at: '2024-01-01', updated_at: '2024-01-01' }),
      });

      const result = await createEmployee(newEmp);
      expect(result.id).toBe(2);
      expect(mockFetch).toHaveBeenCalledWith('/api/employees', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(newEmp),
      }));
    });
  });

  describe('updateEmployee', () => {
    it('updates an employee', async () => {
      const update = { id: 1, salary: 110000 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, salary: 110000 }),
      });

      const result = await updateEmployee(update);
      expect(result.salary).toBe(110000);
      expect(mockFetch).toHaveBeenCalledWith('/api/employees/1', expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ salary: 110000 }),
      }));
    });
  });

  describe('deleteEmployee', () => {
    it('deletes an employee', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });
      await deleteEmployee(1);
      expect(mockFetch).toHaveBeenCalledWith('/api/employees/1', expect.objectContaining({
        method: 'DELETE',
      }));
    });
  });

  describe('fetchAnalytics', () => {
    it('returns analytics data', async () => {
      const mockData = {
        overall: { total_employees: 100, total_payroll: 5000000, min_salary: 30000, max_salary: 200000, avg_salary: 50000 },
        country_analytics: [],
        job_analytics: [],
        department_analytics: [],
        top_earners: [],
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockData });

      const result = await fetchAnalytics({ country: 'USA' });
      expect(result.overall.total_employees).toBe(100);
      expect(mockFetch).toHaveBeenCalledWith('/api/analytics?country=USA');
    });
  });

  describe('fetchFilters', () => {
    it('returns filter options', async () => {
      const mockFilters = { countries: ['USA', 'UK'], job_titles: ['Engineer'], departments: ['Engineering'] };
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockFilters });

      const result = await fetchFilters();
      expect(result.countries).toContain('USA');
    });
  });
});
