# Employee Salary Management Tool - Requirements Document

## Goal

Build a minimal yet usable web-based employee salary management tool for ACME org's HR Manager to manage salary data for roughly 10,000 employees across multiple countries, replacing the current spreadsheet workflow.

## Scope And Features

### 1. Employee Management

- Add employees with employee code, full name, email, job title, country, salary, department, employment type, currency, and hire date.
- View employees in a searchable, filterable, sortable, paginated table.
- Update employee details through an edit form.
- Delete employees with confirmation.
- Search by employee code, full name, email, job title, or department.
- Filter by country and job title.
- Validate employee inputs before persistence, including required fields, valid email, positive salary, allowed employment type, and `YYYY-MM-DD` hire date.

### 2. Salary Insights Dashboard

- Overall employee count, total payroll, average salary, and salary range.
- Minimum, maximum, and average salary by country.
- Average salary by job title and country.
- Department-level headcount, average salary, and payroll.
- Top 10 highest-paid employees.
- Dashboard filters for country and job title.

### 3. Technical Scope

- React + TypeScript + Vite frontend.
- Node.js API handlers under `backend/api`.
- Neon PostgreSQL database through the `pg` client.
- REST-style employee routes for detail/update/delete operations.
- Server-side pagination, search, filtering, sorting, and analytics.
- Seed script for 10,000 generated employees using `first_names.txt` and `last_names.txt`.
- Route-level frontend code splitting for Dashboard and Employees pages.
- Unit and API-focused tests for core behavior.

## Deliberately Left Out

| Feature | Reasoning |
|---------|-----------|
| Authentication/Authorization | The prompt specifies a single HR Manager persona. In production, SSO/OAuth would be required. |
| Multi-currency conversion | Salaries are stored and displayed in USD for consistency. Exchange-rate logic would add external dependency and scope. |
| Salary history/audit trail | Useful for production, but it would require a separate salary-change model and is not core to the current-salary workflow. |
| Bulk CSV/Excel import/export | Helpful for migration, but the v1 focuses on CRUD, filtering, and insights. |
| Role-based permissions | A single user persona does not require viewer/editor/admin roles for this assessment. |
| Payroll processing/payments | This is a salary data management tool, not a payment or payroll execution system. |
| Employee self-service portal | The only user persona is the HR Manager. |
| Predictive compensation analytics | Basic salary aggregates are enough for the prompt and easier to reason about. |

## Performance Considerations

- Employee table uses server-side pagination with a default page size of 50.
- Search, filtering, sorting, and aggregations run in the database.
- Indexes support common access paths: `country`, `job_title`, `(country, job_title)`, `salary`, `full_name`, `employee_code`, and `email`.
- Seed script uses batch inserts of 500 rows.
- Dashboard refresh keeps existing analytics visible to avoid layout flicker.
- Dashboard and Employees pages are lazy-loaded as separate frontend chunks.

## Seed Data Strategy

- Generates 10,000 employees by combining first and last name files.
- Adds realistic HR fields: employee code, email, department, employment type, country, currency, hire date, job title, and salary.
- Salaries are role- and country-aware enough to make analytics meaningful.
- Supports both reset mode and append mode.
