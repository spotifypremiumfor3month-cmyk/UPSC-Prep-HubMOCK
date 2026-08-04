# UPSC Sarthak — Prep Platform

A comprehensive UPSC Civil Services exam preparation platform focused exclusively on UPSC. Admins upload MCQs (bulk via CSV) and PDF study materials daily. Students take timed mock tests, do daily practice sets, and track their progress.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/upsc-prep run dev` — run the frontend (port from $PORT)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite 7 + TailwindCSS 4 + Wouter + Recharts
- API: Express 5 (artifacts/api-server)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (zod/v4 subpath), drizzle-zod
- API codegen: Orval v8 (from OpenAPI spec)
- Build: esbuild (CJS bundle for server)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle table definitions (one file per entity)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/upsc-prep/src/pages/` — React pages
- `artifacts/upsc-prep/src/components/` — UI components + layout shell

## Architecture decisions

- Orval v8.23.0 generates `zod.int()` (Zod v4 syntax) but workspace uses `zod@^3.25.76`. The codegen script uses `sed` to replace the import with `zod/v4` subpath after generation.
- All UPSC subjects are seeded in the `subjects` table at startup — no dynamic creation.
- Bulk MCQ upload: frontend parses CSV client-side, sends array to `POST /api/questions/bulk`.
- Test scoring: per-question marks = totalMarks / questionCount; negative marking applied per attempt.
- The managed workflow injects `PORT` env; frontend dev script passes `--port $PORT --strictPort` to Vite.

## Product

- **Admin**: Bulk upload MCQs (CSV), add single questions, manage test series (draft/publish/archive), upload PDF study materials, schedule daily practice sets by date
- **Student**: Take timed mock tests with question palette + mark-for-review, see detailed score reports with per-question explanations, access daily practice, browse PDFs
- **Dashboard**: Stats (total questions/tests/PDFs/attempts), subject-wise breakdown charts, recent activity feed, leaderboard
- **Subjects**: History, Geography, Polity, Economy, Environment, Science & Technology, Ethics, Current Affairs, CSAT, International Relations, Art & Culture, Disaster Management

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any OpenAPI spec change, run codegen AND the sed post-process (it's part of the codegen script now).
- `pnpm --filter @workspace/db run push` for schema changes; `run push-force` if there are column conflicts.
- Do not hardcode ports — always use `$PORT` from the managed workflow.
