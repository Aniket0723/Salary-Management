# Project Structure

```text
.
|-- frontend/
|   |-- public/              Static frontend assets
|   |-- src/
|   |   |-- __tests__/       Frontend and API client tests
|   |   |-- components/      Reusable UI components
|   |   |-- lib/             Browser-side API client
|   |   |-- pages/           Route-level pages
|   |   |-- App.tsx          App routes
|   |   |-- index.css        Global styles
|   |   `-- main.tsx         React entry point
|   |-- index.html           Vite HTML entry
|   |-- vite.config.ts       Frontend build config
|   |-- vitest.config.ts     Frontend test config
|   `-- tsconfig.app.json    Frontend TypeScript config
|-- backend/
|   |-- api/                 API route implementations
|   |-- db/                  Neon/Postgres connection and schema setup
|   `-- seed/                Seed data generation
|-- scripts/
|   |-- dev-server.mjs       Local full-stack dev server
|   |-- env.mjs              Local env loader
|   `-- seed.mjs             Seed CLI
|-- docs/                    Documentation
|-- .env.example             Environment variable template
|-- package.json             Root scripts and dependencies
|-- package-lock.json        Locked dependency versions
|-- tsconfig.json            TypeScript project references
|-- tsconfig.node.json       Node/config TypeScript config
|-- eslint.config.js         Lint configuration
`-- README.md
```

## API Location

All API behavior lives in `backend/api/`.

There is intentionally no root `api/` folder. The local full-stack server in `scripts/dev-server.mjs` maps browser requests from `/api/*` to the matching `backend/api/*` handler.

This keeps the boundary clean:

- `frontend/` owns browser UI.
- `backend/` owns database and API behavior.
- `scripts/` owns local developer tooling.
- `docs/` owns documentation.

## Generated Files

Generated folders should not be treated as source:

- `node_modules/` is recreated by `npm install`.
- `dist/` is recreated by `npm run build`.
