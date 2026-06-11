# Project Structure

```text
.
|-- frontend/
|   |-- public/              Static frontend assets
|   |-- src/
|   |   |-- __tests__/       Frontend and API client tests
|   |   |-- components/      Reusable UI components, filters, layout, and loading states
|   |   |-- lib/             Browser-side API client and route preload helpers
|   |   |-- pages/           Lazy-loaded route-level pages
|   |   |-- App.tsx          App routes
|   |   |-- index.css        Global styles
|   |   `-- main.tsx         React entry point
|   |-- index.html           Vite HTML entry
|   |-- vite.config.ts       Frontend build config
|   `-- tsconfig.app.json    Frontend TypeScript config
|-- backend/
|   |-- api/                 API route implementations and validation
|   |-- db/                  Neon/Postgres connection, schema setup, and indexes
|   `-- seed/                Batch seed data generation
|-- scripts/
|   |-- dev-server.mjs       Local full-stack dev server
|   |-- env.mjs              Local env loader
|   |-- http-utils.mjs       Shared API request helpers
|   |-- start-server.mjs     Production server for dist/ and /api/*
|   `-- seed.mjs             Seed CLI
|-- docs/                    Documentation
|-- .env.example             Environment variable template
|-- render.yaml              Render Blueprint deployment config
|-- vitest.config.ts         Test config
|-- package.json             Root scripts and dependencies
|-- package-lock.json        Locked dependency versions
|-- tsconfig.json            TypeScript project references
|-- tsconfig.node.json       Node/config TypeScript config
|-- eslint.config.js         Lint configuration
`-- README.md
```

## API Location

All API behavior lives in `backend/api/`.

There is intentionally no root `api/` folder. The local full-stack server in `scripts/dev-server.mjs` maps browser requests from `/api/*` to the matching `backend/api/*` handler. It also maps REST-style employee URLs such as `/api/employees/123` to the employees handler with route params.

The production server in `scripts/start-server.mjs` serves the built `dist/` frontend, exposes `/health` for deployment checks, and maps `/api/*` to the same backend handlers.

This keeps the boundary clean:

- `frontend/` owns browser UI.
- `backend/` owns database, validation, analytics, and API behavior.
- `scripts/` owns local developer tooling.
- `docs/` owns requirements, architecture, project structure, and AI usage/decision artifacts.

## Generated Files

Generated folders should not be treated as source:

- `node_modules/` is recreated by `npm install`.
- `dist/` is recreated by `npm run build`.
