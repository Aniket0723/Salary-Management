# Architecture

## Overview

```text
Browser
  |
  | HTTP
  v
Local full-stack Node dev server
  |-- serves frontend/ through Vite middleware
  `-- maps /api/* requests to backend/api/*
          |
          v
      backend/db/client.js
          |
          v
      Neon PostgreSQL
```

The project is intentionally small but split by responsibility:

- `frontend/` owns browser UI, route rendering, and API client calls.
- `backend/` owns API behavior, validation, persistence, and analytics.
- `scripts/` owns local full-stack development and seeding commands.
- `docs/` owns product and engineering artifacts.

## Frontend

Location: `frontend/`

The frontend is a React + TypeScript + Vite application using Tailwind CSS and React Router.

Key folders:

- `frontend/src/pages`: route-level screens
- `frontend/src/components`: reusable UI components
- `frontend/src/lib`: browser API client and route preload helpers
- `frontend/src/__tests__`: frontend and API client tests

### Frontend Performance

Dashboard and Employees pages are route-level lazy chunks. Navigation links preload route chunks on hover/focus so the initial JavaScript payload is smaller while navigation still feels fast.

The dashboard keeps existing analytics visible during refresh and only spins the refresh icon. This avoids layout flicker after the first load.

## Backend

Location: `backend/`

The backend uses Node.js API handlers. The local development server maps `/api/*` paths to these handlers and also supports REST-style employee route params.

Key folders:

- `backend/api`: API route handlers
- `backend/db`: Neon/PostgreSQL connection and schema setup
- `backend/seed`: generated employee seed data

## Database

Database: Neon PostgreSQL

The app uses the `pg` package with `DATABASE_URL` from `.env.local` or the production environment.

The `employees` table captures identity, organization context, and compensation:

```text
id
employee_code
full_name
email
job_title
country
salary
department
employment_type
currency
hire_date
created_at
updated_at
```

Schema creation is idempotent. Existing databases are upgraded with `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` and safe backfills for employee code, email, hire date, and updated timestamp.

Indexes:

- `employees.country`
- `employees.job_title`
- `employees.country, employees.job_title`
- `employees.salary`
- `employees.full_name`
- `employees.employee_code`
- `employees.email`

The combined country/job-title index supports the main salary-insight filter path.

## Validation

Employee create/update payloads are validated with `zod` before SQL runs.

Validation covers:

- required employee code
- required full name
- valid email
- required job title
- required country
- positive integer salary
- allowed employment type
- currency text
- `YYYY-MM-DD` hire date

Unique employee code and email conflicts return a `409` response.

## API Routes

Implemented in `backend/api/`:

- `GET /api/employees`
- `GET /api/employees/:id`
- `POST /api/employees`
- `PUT /api/employees/:id`
- `DELETE /api/employees/:id`
- `GET /api/analytics`
- `GET /api/filters`
- `POST /api/seed`

The employee list endpoint supports:

- `page`
- `limit`
- `search`
- `country`
- `job_title`
- `sort_by`
- `sort_order`

Analytics are computed in SQL rather than in frontend memory.

## Seeding

Location: `backend/seed/employees.js`

Seed commands:

```bash
npm run seed
npm run seed:append -- 1000
```

`npm run seed` resets the table and inserts generated employees.
`npm run seed:append` adds generated employees without deleting existing rows.

The seed script:

- uses first and last name source files
- generates employee codes and emails
- generates hire dates
- inserts in batches of 500 rows
- uses append-safe employee code sequencing

## Testing And Quality

The project uses Vitest, React Testing Library, ESLint, and TypeScript build checks.

Current core checks:

```bash
npm run lint
npm run test
npm run build
```

The test suite covers API client behavior, employee API validation and REST routes, analytics, filters, seeding behavior, and frontend analytics rendering.
