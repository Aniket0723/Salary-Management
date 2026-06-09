export interface Employee {
  id: number;
  employee_code: string;
  full_name: string;
  email: string;
  job_title: string;
  country: string;
  salary: number;
  department: string;
  employment_type: string;
  currency: string;
  hire_date: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface CountryAnalytics {
  country: string;
  count: number;
  total_payroll: number;
  min_salary: number;
  max_salary: number;
  avg_salary: number;
}

export interface JobAnalytics {
  key: string;
  job_title: string;
  country: string;
  count: number;
  avg_salary: number;
}

export interface DepartmentAnalytics {
  department: string;
  count: number;
  avg_salary: number;
  total_payroll: number;
}

export interface AnalyticsData {
  overall: {
    total_employees: number;
    total_payroll: number;
    min_salary: number;
    max_salary: number;
    avg_salary: number;
  };
  country_analytics: CountryAnalytics[];
  job_analytics: JobAnalytics[];
  department_analytics: DepartmentAnalytics[];
  top_earners: Employee[];
}

export interface Filters {
  countries: string[];
  job_titles: string[];
  departments: string[];
}
