# Workspace

## Overview

pnpm workspace monorepo containing **Qassa** — a home barber booking service in Arabic (RTL).
Customers book a barber to come to their home, then track their queue position live.

## Artifacts

- `artifacts/qassa` — React + Vite frontend (Arabic RTL, dark green + off-white palette)
- `artifacts/api-server` — Express 5 API server (Node 24)
- `artifacts/mockup-sandbox` — Component prototyping sandbox

## Pages

- `/` — Home (hero + CTA to book)
- `/book` — Booking form (name, phone, block/building/apartment, datetime)
- `/queue/:id` — Live queue tracking (auto-refresh every 5s)
- `/gallery` — Auto-rotating styles carousel + recent customers grid
- `/admin` — Manage bookings (status updates) and gallery items (add/delete)

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Frontend**: React + Vite, Tailwind v4, shadcn/ui, framer-motion, react-query, wouter, react-hook-form
- **Build**: esbuild (CJS bundle)

## Database Schema

- `bookings` — id, full_name, phone, block_number, building_number, apartment_number, scheduled_at, status (pending/in_progress/completed/cancelled), notes, timestamps
- `gallery_items` — id, section (styles/customers), image_url, title, style_type, created_at

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Notes

- The Zod barrel re-export (`lib/api-zod/src/index.ts`) explicitly aliases the
  `*Body` schemas with a `Schema` suffix to avoid colliding with the inferred TS interfaces.

## Render.com deployment

- `render.yaml` at repo root defines the free Postgres DB + single web service.
- In production (`NODE_ENV=production`), `api-server/src/app.ts` serves the built
  qassa frontend from `STATIC_DIR` (default `artifacts/qassa/dist/public`) and
  uses an SPA catch-all so wouter routes resolve to `index.html`.
- `qassa/vite.config.ts` defaults `BASE_PATH=/` and makes `PORT` optional, so the
  Vite build works on Render without Replit-specific env vars.
- Build pipeline: install → build qassa → build api-server → `db push-force`.
- Required secrets in Render dashboard: `ADMIN_PASSWORD` (sync: false). All
  others (`DATABASE_URL`, `SESSION_SECRET`, `BASE_PATH`, `STATIC_DIR`,
  `NODE_ENV`) are wired automatically via `render.yaml`.
