# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server on port 8080
npm run build      # Type-check (tsc -b) then bundle (vite build)
npm run preview    # Preview production build
```

There are no lint or test scripts configured.

## Architecture

React 19 SPA with:
- **Routing:** React Router v7 with `HashRouter`
- **Backend/Auth:** Supabase (PostgreSQL + Auth)
- **Styling:** Tailwind CSS v4 + DaisyUI v5 with custom Mendelu theme
- **Build:** Vite, deployed to Vercel

### Structure

- `src/App.tsx` — Root: manages Supabase auth session, renders `AppLayout` or `LoginScreen`
- `src/components/` — Shared layout components (AppLayout, Sidebar, ThemeToggle)
- `src/features/` — Feature modules, each is a page-level view:
  - `auth/` — Login form and settings modal
  - `notifications/` — Main active feature; list, create, and preview notifications
  - `tutorials/` — Infrastructure exists but is commented out/disabled
  - `users/` — Exists but not yet routed
- `src/lib/` — Supabase client (`supabase.ts`), auto-generated DB types (`database.types.ts`), utils

### Key conventions

- `@/*` path alias maps to `src/*`
- TypeScript strict mode is fully enabled (`noUnusedLocals`, `noUnusedParameters`, etc.)
- Dark theme is the default (`data-theme="mendelu-dark"` on `<html>`)
- Custom brand colors: primary `#79be15` (Mendelu green), accent `#00548f` / `#3b82f6` (dark mode)
- `database.types.ts` is auto-generated from the remote Supabase schema — do not hand-edit it

### Environment variables

Required in `.env`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` — public anon key (safe to expose client-side, RLS enforces access)

**Note:** `VITE_SUPABASE_SERVICE_ROLE_KEY` must NOT be used client-side — it bypasses all RLS.
