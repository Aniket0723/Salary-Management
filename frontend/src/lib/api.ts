import type { Employee, PaginatedResponse, AnalyticsData, Filters } from '../types';

const API_BASE = '/api';

export async function fetchEmployees(params: {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  job_title?: string;
  sort_by?: string;
  sort_order?: string;
} = {}): Promise<PaginatedResponse<Employee>> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') query.set(k, String(v));
  });
  const res = await fetch(`${API_BASE}/employees?${query}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export type EmployeePayload = Omit<Employee, 'id' | 'created_at' | 'updated_at'>;

export async function fetchEmployee(id: number): Promise<Employee> {
  const res = await fetch(`${API_BASE}/employees/${id}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createEmployee(employee: EmployeePayload): Promise<Employee> {
  const res = await fetch(`${API_BASE}/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(employee),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateEmployee(employee: Partial<Employee> & { id: number }): Promise<Employee> {
  const { id, ...payload } = employee;
  const res = await fetch(`${API_BASE}/employees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteEmployee(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/employees/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function fetchAnalytics(params: { country?: string; job_title?: string } = {}): Promise<AnalyticsData> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') query.set(k, String(v));
  });
  const res = await fetch(`${API_BASE}/analytics?${query}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchFilters(): Promise<Filters> {
  const res = await fetch(`${API_BASE}/filters`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function seedDatabase(count: number = 10000): Promise<{ seeded: number; message: string }> {
  const res = await fetch(`${API_BASE}/seed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
