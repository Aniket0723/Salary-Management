# ACME Salary Management

Full-stack salary management dashboard for HR teams. It supports employee CRUD, searchable and filterable employee tables, salary analytics, and generated seed data for Neon PostgreSQL.

## Tech Stack

Frontend:
- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- React Router
- Lucide React icons

Backend:
- Node.js API handlers
- Native Node HTTP server for local full-stack development
- `pg` PostgreSQL client
- `zod` payload validation
- Neon PostgreSQL

Testing and quality:
- Vitest
- React Testing Library
- ESLint
- TypeScript build checks
- npm audit

## Features

- Dashboard with employee count, total payroll, average salary, salary range, country analytics, job analytics, department analytics, and top earners.
- Employee table with search, country filter, job title filter, sorting, pagination, create, edit, and delete.
- Employee data model with employee code, full name, email, job title, country, salary, department, employment type, currency, hire date, created timestamp, and updated timestamp.
- REST-style employee detail/update/delete routes.
- Server-side pagination, filtering, sorting, and SQL-backed analytics.
- Route-level frontend code splitting with preloading on navigation hover/focus.
- Seed script for 10,000 employees using batch inserts.

## Folder Structure

```text
.
|-- frontend/            # React/Vite frontend application
|   |-- public/          # Static frontend assets
|   |-- src/             # Frontend source code
|   |-- index.html       # Frontend HTML entry
|   |-- vite.config.ts   # Frontend build config
|   |-- vitest.config.ts # Frontend test config
|   `-- tsconfig.app.json
|-- backend/             # Backend source code
|   |-- api/             # API route implementations
|   |-- db/              # Neon/Postgres connection and schema setup
|   `-- seed/            # Employee seed data generator
|-- scripts/             # Local full-stack dev and seed CLI scripts
|-- docs/                # Project docs and architecture notes
`-- package.json         # Root workspace scripts and dependencies
```

There is no root `api/` folder anymore. All API logic lives in `backend/api/`. During local development, `scripts/dev-server.mjs` exposes those handlers at `/api/*` while serving the frontend.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` from `.env.example` and set `DATABASE_URL` to your Neon connection string.

3. Start frontend and backend together:

   ```bash
   npm run dev
   ```

   The local app runs at `http://localhost:5173`.

## Seed Data

Reset the table and seed 10,000 employees into the configured Neon database:

```bash
npm run seed
```

Reset and seed a custom number:

```bash
npm run seed -- 2500
```

Append generated employees without clearing existing rows:

```bash
npm run seed:append -- 1000
```

The seed command creates or upgrades the `employees` table and indexes if they do not exist. `npm run seed` clears existing rows and resets IDs; `npm run seed:append` only inserts additional rows.

Generated seed employees include employee code, full name, email, job title, country, salary, department, employment type, currency, and hire date.

## API Summary

Employee routes:

```text
GET    /api/employees
GET    /api/employees/:id
POST   /api/employees
PUT    /api/employees/:id
DELETE /api/employees/:id
```

Analytics and utility routes:

```text
GET  /api/analytics
GET  /api/filters
POST /api/seed
```

Employee list query parameters:

```text
page
limit
search
country
job_title
sort_by
sort_order
```

Employee create/update payloads are validated with `zod` before database writes.

## Checks

```bash
npm run lint
npm run test
npm run build
npm audit
```

At the time of writing, the test suite contains 23 passing tests covering backend handlers, seed behavior, frontend API client behavior, and analytics rendering.

## Docs

- [Architecture](docs/ARCHITECTURE.md)
- [Requirements](docs/REQUIREMENTS.md)
- [Project Structure](docs/PROJECT_STRUCTURE.md)
- [AI Usage and Decisions](docs/AI_USAGE_AND_DECISIONS.md)

## Deployment

Recommended path: deploy the Node app as a web service on Render or Railway and keep PostgreSQL on Neon.

Set `DATABASE_URL` in production environment variables. Do not commit real database URLs or service credentials.

Current local command:

```text
Install command: npm install
Build command: npm run build
Local start command: npm run dev
Environment: DATABASE_URL=<your Neon connection string>
```

For a production deployment, add a dedicated production start command that serves `dist/` statically and maps `/api/*` to the same backend handlers. The current `npm run dev` command is intended for local full-stack development.
