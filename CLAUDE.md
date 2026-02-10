# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LoaOne (로아원) is a Korean Lost Ark MMO information platform. It provides character search, growth tracking, real-time rankings, raid guides, and an avatar showcase — all built as a Next.js full-stack app deployed on Vercel.

## Commands

```bash
npm run dev            # Dev server with Turbopack
npm run build          # Type-check (tsc --noEmit) then production build
npm run build:test     # Tests + type-check + production build
npm run lint           # ESLint
npm run type-check     # TypeScript only (no emit)
npm test               # Jest
npm run test:watch     # Jest watch mode
npm run test:coverage  # Jest with coverage
```

Run a single test file: `npx jest path/to/file.test.ts`

## Tech Stack

- **Next.js 16** (App Router, React Server Components, React Compiler enabled)
- **React 19** with **TypeScript 5** (strict mode, `noUnusedLocals`, `noImplicitAny`)
- **Tailwind CSS 4** + **Shadcn/ui** (Radix UI primitives)
- **React Query 5** for server state, **Zustand 5** for client state
- **Supabase** (PostgreSQL + Auth via Discord OAuth + Row-Level Security)
- **Lost Ark Official API** proxied through Next.js API routes
- **Framer Motion** for animations, **Recharts** for charts
- **Jest 30** + **React Testing Library** for tests

## Architecture

### Data Flow Pattern

Server components fetch initial data via Supabase/API → passed as `initialData` to React Query hooks on the client → React Query handles caching, background refetch, and stale-while-revalidate.

### Route Structure

```
src/app/
├── page.tsx                      # Home (SSR: events, news, popular searches)
├── characters/[name]/page.tsx    # Character detail (9 tabs)
├── rankings/page.tsx             # Server-side rankings
├── cunning-paper/page.tsx        # Raid guide list
├── cunning-paper/[id]/page.tsx   # Individual raid guide
├── showcase/page.tsx             # Avatar showcase gallery
├── showcase/[id]/page.tsx        # Showcase detail
├── showcase/register/page.tsx    # Submit showcase
├── profile/page.tsx              # User profile (auth required)
├── setup-character/page.tsx      # First-time character setup
└── api/                          # API routes (see below)
```

### API Routes

All under `src/app/api/`. These proxy the Lost Ark official API and handle Supabase CRUD:

- `lostark/[name]/` — Character data from Lost Ark API (requires `LOSTARK_API_KEY`)
- `lostark/news/`, `lostark/history/` — Game news, character history
- `favorites/` — User favorites CRUD (auth required)
- `rankings/` — Character rankings
- `popular/` — Popular search terms
- `showcase/` — Avatar showcase CRUD
- `raids/` — Raid guide data

### Key Directories

- `src/components/` — Organized by feature: `character/`, `home/`, `rankings/`, `showcase/`, `cunning-paper/`, `common/`, `ui/`
- `src/hooks/query/` — React Query hooks grouped by domain (`lostark/character/`, `lostark/news/`, `showcase/`)
- `src/hooks/store/` — Zustand stores (`useFavoriteStore`, `useCharacterStore`, `useUserStore`, `useShowcaseLikeStore`, `useNoticeStore`)
- `src/lib/supabase/` — Supabase clients (`client/client.ts` for browser, `server/server.ts` for SSR) and DB operations
- `src/lib/api/server.ts` — Server-side Lost Ark API calls
- `src/utils/` — Parsers for game data (accessories, bracelets, collectibles)
- `src/types/` — TypeScript interfaces for characters, Lost Ark API responses, showcase, database
- `src/constants/lostark/` — Game constants (grade styles, gold values, item options)

### Authentication

Discord OAuth through Supabase. Middleware (`src/middleware.ts`) checks auth on all routes except `/setup-character`, `/auth`, `/api`, and static assets. Unauthenticated users without a `main_character` in metadata are redirected to `/setup-character`.

### Styling

- Dark theme with emerald/slate gradient background
- Max content width: 1400px
- Custom breakpoints: `nav` (1130px), `desktop` (1400px)
- Design tokens in `src/styles/tokens.ts`
- Grade-based color system for item rarity in `src/constants/lostark/styles.ts`

## Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json and jest.config.js).

## Environment Variables

- `LOSTARK_API_KEY` — Lost Ark API key
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key

## Formatting

Prettier with Tailwind CSS class sorting plugin (`.prettierrc`). No semicolons are not enforced — the project uses semicolons.
