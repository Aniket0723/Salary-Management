# AI Usage And Engineering Decisions

## How AI Was Used

AI was used as a coding and review assistant throughout the project to speed up implementation while keeping the final decisions human-directed.

The main areas where AI helped:

- Breaking the assessment prompt into product requirements and implementation scope
- Drafting and refining the requirements document
- Planning frontend/backend structure
- Implementing employee CRUD, analytics, filters, and seed workflows
- Improving UI polish through iterative feedback
- Adding tests and running quality checks after changes
- Identifying product-fit issues, such as removing the seed button from the HR dashboard

AI suggestions were reviewed against the assessment requirements before being accepted. When a suggestion did not fit the HR Manager persona, it was changed or removed.

## Product Decisions

### Single HR Manager Persona

The app is designed around one primary user: an HR Manager. This led to a simple dashboard and employee management experience without authentication, role management, or employee self-service.

### Dashboard First

The Dashboard focuses on salary insights that answer likely HR questions:

- How many employees are in the dataset?
- What is total payroll?
- What are minimum, maximum, and average salaries?
- How do salaries vary by country, job title, and department?
- Who are the highest earners?

### Employee Table

The employee table prioritizes practical management workflows:

- Search
- Country and job title filters
- Sorting
- Pagination
- Add, edit, and delete actions

Filters are server-backed so the UI remains usable with 10,000 employees.

## Deliberate Trade-Offs

### No Authentication

Authentication was left out because the prompt describes a single HR Manager persona. Adding auth would increase complexity without improving the core assessment workflow. In production, SSO/OAuth would be required.

### Seed Script Instead Of UI Seed Action

The assessment asks for a seed script and notes that engineers may run it regularly. A `Seed 10K Employees` button was removed from the HR dashboard because seeding is an engineering task, not an HR Manager workflow. This also avoids exposing a destructive data reset action in the product UI.

### USD-Only Salary Display

The app stores and displays salaries in USD for consistency. Multi-currency conversion was excluded because it would require exchange-rate handling and distract from the core salary management workflow.

### No Bulk Import/Export

Bulk CSV/Excel import would be useful in a real migration from spreadsheets, but it was left out to keep the v1 focused on CRUD, filtering, and insights.

## Technical Decisions

### React + Vite Frontend

React with Vite was chosen for a fast development workflow, strong TypeScript support, and easy production builds.

### Backend API Handlers

API logic is kept under `backend/api`, while the local development server maps `/api/*` requests to those handlers. This keeps frontend and backend boundaries clear.

### PostgreSQL

PostgreSQL is a good fit for salary data because it supports relational structure, filtering, sorting, indexing, and aggregate analytics.

### Server-Side Pagination And Filtering

The employee list uses server-side pagination, search, filtering, and sorting so the browser does not need to render or process all 10,000 records at once.

### Route-Level Code Splitting

Dashboard and Employees pages are lazy-loaded as separate chunks. Navigation preloads route chunks on hover/focus so the initial bundle is smaller while page transitions still feel fast.

## Performance Considerations

- Employee table fetches only one page at a time
- Filters and analytics are calculated by the backend/database
- Database indexes support common filter and sort paths
- Seed script uses batch inserts
- Frontend route chunks reduce initial JavaScript payload
- Refreshing analytics keeps the existing layout visible to avoid UI flicker

## Quality Checks

The project includes fast deterministic checks:

```bash
npm run lint
npm run test
npm run build
```

These were run repeatedly during implementation to catch regressions after UI and architecture changes.
