# Employee Salary Management Tool — Requirements Document

## Goal
Build a minimal yet usable web-based employee salary management tool for ACME org's HR Manager to manage salary data for ~10,000 employees across multiple countries, replacing the current Excel-based workflow.

## Scope & Features (In Scope)

### 1. Employee Management
- **Add** new employees with: employee code, full name, email, job title, country, salary, department, employment type, currency, hire date
- **View** all employees in a searchable, filterable, paginated table
- **Update** employee details inline or via edit form
- **Delete** employees with confirmation
- **Search** by name, job title, or department
- **Filter** by country and job title
- **Pagination** for performance with large datasets

### 2. Salary Insights Dashboard
- Minimum, maximum, and average salary per country
- Average salary per job title (globally and per country)
- Total headcount and total payroll per country
- Department-wise salary distribution
- Top 10 highest-paid employees
- Currency-aware display (all salaries stored in USD for consistency)

### 3. Technical
- Responsive UI (desktop-first, usable on mobile)
- Fast search and filtering (server-side pagination)
- Seeding script for 10,000 employees with realistic data from `backend/seed/data/first_names.txt` and `backend/seed/data/last_names.txt`
- Unit tests for core functionality

## Deliberately Left Out (With Reasoning)

| Feature | Reasoning |
|---------|-----------|
| **Authentication/Authorization** | The prompt specifies a single HR Manager persona. Adding auth adds complexity without value for this assessment. In production, we'd add SSO/OAuth. |
| **Multi-currency conversion** | All salaries stored in USD for consistency. Real-time exchange rates would require an external API and add unnecessary complexity. |
| **Salary history/audit trail** | Would require a separate `salary_changes` table. Useful but not core to the "manage current salaries" use case. |
| **Bulk import/export (CSV/Excel)** | The prompt focuses on replacing Excel, not integrating with it. Bulk import would be a v2 feature. |
| **Advanced role-based access** | Single user persona means no need for roles like "viewer" vs "editor". |
| **Real-time notifications** | Not relevant for a salary management tool used by one person. |
| **Payroll processing/payments** | Out of scope — this is a data management tool, not a payroll system. |
| **Employee self-service portal** | Only HR Manager is the user; employees don't need access. |
| **Performance reviews integration** | Salary management is distinct from performance management. |
| **Advanced analytics (predictive)** | Basic aggregations suffice; ML/predictions are overkill for v1. |

## Architecture
- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js API handlers under `backend/api`
- **Database**: Neon PostgreSQL (relational, excellent for aggregations)
- **Deployment**: Environment-driven Node/Vite deployment

## Performance Considerations
- Server-side pagination (50 records per page) to keep UI responsive
- Database indexes on `country`, `job_title`, `salary` for fast filtering
- Aggregations computed at database level, not in memory
- Seeding script uses batch inserts for speed

## Seed Data Strategy
- 10,000 employees generated from `first_names.txt` + `last_names.txt` combinations
- 15 realistic job titles, 10 countries, 5 departments
- Salaries follow realistic distributions per country/role
- Batch insert of 500 rows at a time for performance
