import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AnalyticsCards from '../components/AnalyticsCards';
import type { AnalyticsData } from '../types';

const mockAnalytics: AnalyticsData = {
  overall: {
    total_employees: 1000,
    total_payroll: 50000000,
    min_salary: 30000,
    max_salary: 200000,
    avg_salary: 50000,
  },
  country_analytics: [
    { country: 'USA', count: 500, total_payroll: 30000000, min_salary: 40000, max_salary: 200000, avg_salary: 60000 },
    { country: 'UK', count: 300, total_payroll: 15000000, min_salary: 35000, max_salary: 150000, avg_salary: 50000 },
  ],
  job_analytics: [
    { key: 'Engineer | USA', job_title: 'Engineer', country: 'USA', count: 100, avg_salary: 70000 },
  ],
  department_analytics: [
    { department: 'Engineering', count: 400, avg_salary: 65000, total_payroll: 26000000 },
  ],
  top_earners: [
    {
      id: 1,
      employee_code: 'ACME-00001',
      full_name: 'Alice Smith',
      email: 'alice.smith@acme.example',
      job_title: 'CEO',
      country: 'USA',
      salary: 200000,
      department: 'Executive',
      employment_type: 'Full-time',
      currency: 'USD',
      hire_date: '2020-01-01',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
  ],
};

describe('AnalyticsCards', () => {
  it('renders loading state', () => {
    render(<AnalyticsCards data={null} loading={true} />);
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('renders analytics data correctly', () => {
    render(<AnalyticsCards data={mockAnalytics} loading={false} />);
    expect(screen.getByText('1,000')).toBeInTheDocument();
    expect(screen.getByText('$50,000,000')).toBeInTheDocument();
    expect(screen.getAllByText('$50,000').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('USA').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
  });

  it('renders null when no data and not loading', () => {
    const { container } = render(<AnalyticsCards data={null} loading={false} />);
    expect(container.firstChild).toBeNull();
  });
});
