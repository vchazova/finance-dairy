# Finance Diary

Finance Diary is a personal finance diary built with Next.js App Router, Supabase, Tailwind, and TypeScript. You can add expenses/incomes with amount, currency, category, and payment method. The architecture is layered to keep API routes thin and data access pluggable.

## Architecture at a glance
- API routes (`src/app/api/**`) validate input with zod, authenticate via Supabase, check workspace membership, then delegate to data repositories. Responses are JSON-only.
- Data layer (`src/data`) has switchable repos: `mock` (local/demo) and `supabase` (production). `createDataRepos` picks the right ones and can accept a server Supabase client.
- Supabase helpers in `src/lib/supabase/api.ts` create server-side clients and perform membership checks. Entity normalizers (`src/entities/**/normalize.ts`) centralize DTO → domain conversion (amount/date/id parsing).
- AuthZ: each route calls `auth.getUser()` and `assertWorkspaceMembership`, relying on Supabase RLS. Workspace member mutations are owner-only.

## Features / CRUD coverage
- Transactions: full CRUD, scoped by workspace.
- Dictionaries: currencies (global), categories/payment types (workspace-scoped) with full CRUD.
- Workspaces: list/create/update/delete; members: list/add/remove (owner-only).
- Data modes: `mock` (default if `NEXT_PUBLIC_DATA_MODE` unset) or `supabase`.

## Frontend data access
- `useApiFetch` attaches credentials + bearer token from `AuthProvider` and normalizes errors.
- Client components call API routes; SSR pages can hydrate with initial data to avoid duplicate fetches.
- Normalizers keep DTO parsing consistent between API and UI.

## Getting Started
1) Set env:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_DATA_MODE=supabase   # or mock
```
2) Install and run:
```
npm install
npm run dev
```
3) Open http://localhost:3000

## Tech Stack
- Next.js 15 (App Router)
- Supabase (DB, auth)
- Tailwind CSS
- TypeScript
- Zustand (UI state)
- TanStack Query (planned for client data caching)

## Next steps
- Add TanStack Query caching with `initialData`.
- Expand tests for normalizers and API handlers.
- Optional: merge dictionary/transaction fetches to reduce roundtrips and add workspace settings UI.
