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
- Framer Motion

Backend:
- Node.js API handlers
- Native Node HTTP server for local full-stack development
- `pg` PostgreSQL client
- Neon PostgreSQL

Testing and quality:
- Vitest
- React Testing Library
- ESLint
- TypeScript build checks
- npm audit

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

The seed command creates the `employees` table and indexes if they do not exist. `npm run seed` clears existing rows and resets IDs; `npm run seed:append` only inserts additional rows.

## Checks

```bash
npm run lint
npm run test
npm run build
npm audit
```

## Docs

- [Architecture](docs/ARCHITECTURE.md)
- [Requirements](docs/REQUIREMENTS.md)
- [Project Structure](docs/PROJECT_STRUCTURE.md)
- [AI Usage and Decisions](docs/AI_USAGE_AND_DECISIONS.md)

## Deployment

Set `DATABASE_URL` in your production environment variables. Do not commit real database URLs or service credentials.
