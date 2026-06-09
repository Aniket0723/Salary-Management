# Architecture

## Overview

```text
Browser
  |
  | HTTP
  v
Local full-stack dev server
  |-- serves frontend/ through Vite middleware
  `-- maps /api/* requests to backend/api/*
          |
          v
      backend/db/client.js
          |
          v
      Neon PostgreSQL
```

## Frontend

Location: `frontend/`

The frontend is a React + TypeScript + Vite application. It owns all browser UI, routing, styles, components, and browser-side API calls.

Key folders:

- `frontend/src/pages`: route-level screens
- `frontend/src/components`: reusable UI components
- `frontend/src/lib`: browser API client
- `frontend/src/__tests__`: frontend and API client tests

## Backend

Location: `backend/`

The backend owns database access, API behavior, and seed generation.

Key folders:

- `backend/api`: API route handlers
- `backend/db`: Neon/Postgres connection and schema setup
- `backend/seed`: generated employee seed data

There is no root `api/` folder. API logic lives only in `backend/api/`.

## Local Development

Location: `scripts/dev-server.mjs`

The local dev server starts Vite in middleware mode for `frontend/` and exposes backend handlers under `/api/*`.

This gives one local URL:

```text
http://localhost:5173
```

## Database

Database: Neon PostgreSQL

The app uses the `pg` package with `DATABASE_URL` from `.env.local`.

The database client creates the `employees` table and indexes if they do not exist:

- `employees.country`
- `employees.job_title`
- `employees.salary`
- `employees.full_name`

## API Routes

Implemented in `backend/api/`:

- `GET /api/employees`
- `POST /api/employees`
- `PUT /api/employees`
- `DELETE /api/employees`
- `GET /api/analytics`
- `GET /api/filters`
- `POST /api/seed`

## Seeding

Location: `backend/seed/employees.js`

Seed commands:

```bash
npm run seed
npm run seed:append -- 1000
```

`npm run seed` resets the table and inserts generated employees.
`npm run seed:append` adds generated employees without deleting existing rows.

## Performance

- Server-side pagination for employee table
- Database-level filtering, sorting, and aggregation
- Parameterized SQL queries
- Batch inserts for seed data
- Indexes for common filters and sorting
