# AGENTS.md

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## Project Overview

**PrepForge** is an AI-powered interview and job preparation platform. Users can:

- Practice mock interviews with a real-time AI voice interviewer (powered by Hume AI)
- Get their resumes analyzed and optimized for ATS
- Generate and practice technical/behavioral interview questions
- Track progress across job applications

**Tech Stack:**
- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript (strict mode)
- **Auth**: Clerk (`@clerk/nextjs` v7)
- **Database**: NeonDB (serverless PostgreSQL) via Drizzle ORM
- **AI**: Vercel AI SDK (`ai`) + `@ai-sdk/google` (Gemini)
- **Voice AI**: Hume AI (`hume`, `@humeai/voice-react`)
- **Rate limiting / Bot protection**: Arcjet (`@arcjet/next`)
- **UI**: shadcn/ui components + Radix UI + Tailwind CSS v4
- **Styling**: Tailwind CSS v4, `tw-animate-css`, `next-themes` (dark/light mode)
- **Forms**: React Hook Form + Zod v4
- **SEO**: Next.js App Router metadata API, JSON-LD, sitemap, robots

---

## Setup Commands

```bash
# Install dependencies (uses npm)
npm install

# Set up environment variables — copy and fill in all values
cp .env.example .env  # (if it doesn't exist, create .env manually — see Environment Variables section)

# Push the schema to the database (no migration files needed in dev)
npm run db:push

# Start the development server
npm run dev
```

### Environment Variables

Create a `.env` file in the project root with the following keys:

**Server-side (never exposed to the browser):**
```
ARCJET_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
HUME_API_KEY=
HUME_SECRET_KEY=
GEMINI_API_KEY=
```

**Client-side (prefixed with `NEXT_PUBLIC_`):**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/app
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/onboarding
NEXT_PUBLIC_HUME_CONFIG_ID=
```

> All env vars are validated at startup via `@t3-oss/env-nextjs` + Zod. The schemas are in `src/data/env/server.ts` and `src/data/env/client.ts`. Missing or empty required vars will throw at build/runtime.

### Webhook Dev Setup

To test Clerk webhooks locally, run ngrok alongside the dev server:

```bash
npm run dev:webhook  # runs: ngrok http 3000
```

---

## Development Workflow

```bash
npm run dev          # Start Next.js dev server (http://localhost:3000)
npm run lint         # Lint the project
npm run lint:fix     # Auto-fix lint issues
npm run build        # Production build
npm run start        # Start production server
```

### Database Commands

```bash
npm run db:push      # Push schema changes directly to DB (preferred in dev)
npm run db:generate  # Generate migration files
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio (visual DB explorer)
```

---

## Project Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (ClerkProvider, ThemeProvider, fonts, metadata)
│   ├── page.tsx            # Landing/marketing page
│   ├── robots.ts           # robots.txt generation
│   ├── sitemap.ts          # Sitemap generation
│   ├── globals.css         # Global styles (Tailwind v4)
│   ├── sign-in/            # Clerk hosted sign-in UI
│   ├── onboarding/         # User onboarding flow (runs after first sign-up)
│   ├── app/                # Authenticated app shell
│   │   ├── layout.tsx      # Authenticated layout
│   │   ├── page.tsx        # App dashboard
│   │   └── job-infos/      # Job info management routes
│   │       ├── new/        # Create new job info
│   │       └── [jobInfoId]/# Per-job info detail (interviews, questions, etc.)
│   └── api/
│       ├── ai/             # AI API routes (streaming, generation)
│       └── webhooks/       # Clerk webhook handlers (excluded from middleware)
├── components/             # Shared UI components
│   ├── ui/                 # shadcn/ui generated components
│   ├── seo/                # JSON-LD, structured data components
│   ├── back-link.tsx
│   ├── markdown-renderer.tsx
│   ├── skeleton.tsx
│   ├── suspended-item.tsx
│   └── theme-toggle.tsx
├── features/               # Feature-scoped modules
│   ├── interviews/
│   ├── job-infos/
│   ├── questions/
│   ├── resume-analyses/
│   └── users/
├── services/               # External service integrations
│   ├── ai/                 # Vercel AI SDK wrappers
│   ├── clerk/              # Clerk auth helpers and ClerkProvider wrapper
│   └── hume/               # Hume AI voice session helpers
├── drizzle/                # Database layer
│   ├── db.ts               # Drizzle client (NeonDB serverless)
│   ├── schema.ts           # Re-exports all schema tables
│   ├── schema-helpers.ts   # Shared column helpers
│   └── schema/             # Individual table schemas
│       ├── user.ts
│       ├── job-info.ts
│       ├── interview.ts
│       └── question.ts
├── data/
│   └── env/
│       ├── server.ts       # Server env validation (t3-oss/env-nextjs)
│       └── client.ts       # Client env validation
├── lib/
│   ├── utils.ts            # cn() utility (clsx + tailwind-merge)
│   ├── data-cache.ts       # Cache tag helpers (getGlobalTag, getUserTag, etc.)
│   ├── formatters.ts       # Data formatting utilities
│   └── error-toast.tsx     # Sonner error toast helper
└── proxy.ts                # Next.js middleware (Clerk auth + Arcjet protection)
```

### Routing & Auth

- **Public routes**: `/`, `/sign-in(.*)`
- **Protected routes**: Everything else, enforced via Clerk middleware in `src/proxy.ts`
- **Onboarding redirect**: After sign-up, Clerk redirects to `/onboarding` where a DB user record is created. After that, users go to `/app`.
- The middleware file is `src/proxy.ts` (not the default `middleware.ts`). This is configured in `next.config.ts` if needed.

### Caching Strategy

The project uses **Next.js `"use cache"`** (experimental) with tagged cache invalidation. Cache tags are generated in `src/lib/data-cache.ts`:

- `getGlobalTag(tag)` → `global:<tag>` — invalidates all data of that type
- `getUserTag(tag, userId)` → `user:<userId>:<tag>` — invalidates a user's data
- `getJobInfoTag(tag, jobInfoId)` → `jobInfo:<jobInfoId>:<tag>` — job-scoped invalidation
- `getIdTag(tag, id)` → `id:<id>:<tag>` — invalidates a single record

Available cache tags: `"users"`, `"jobInfos"`, `"interviews"`, `"questions"`.

---

## Code Style & Conventions

### TypeScript

- Strict mode is enabled. No `any` unless absolutely necessary.
- Use `@/` alias for all internal imports (maps to `src/`).
- Prefer `type` imports: `import type { Metadata } from "next"`.
- Zod v4 is used for all validation (note: Zod v4 has breaking changes from v3 — check the Zod docs before using `.parse`, `.safeParse`, etc.).

### Import Order (enforced by ESLint)

Imports must follow this order (enforced via `eslint-plugin-simple-import-sort`):

1. Side-effect imports (`import "./globals.css"`)
2. React and Next.js imports
3. Third-party packages
4. Internal aliases (`@/...`)
5. Parent imports (`../`)
6. Sibling imports (`./`)

### JSX Props Order

JSX props must be sorted alphabetically (`react/jsx-sort-props`), with:
- `key`, `ref` reserved props first
- Event callbacks last
- Case-insensitive sort

### Naming Conventions

- **Files**: `kebab-case.tsx` for components and pages
- **Components**: `PascalCase`
- **Server Actions / Queries**: co-located in feature folders under `src/features/<feature>/`
- **Private route components**: prefix with `_` (e.g., `_navbar.tsx`, `_client.tsx`) to prevent them from becoming routes

### Environment Variables

- **Never** access `process.env` directly. Always import from `@/data/env/server` or `@/data/env/client`.
- Server env is only safe in Server Components, API routes, and server actions.
- Client env can be used in client components but only `NEXT_PUBLIC_*` vars.

### Shadcn Components

- `components.json` is configured at the project root.
- When adding new shadcn components: `npx shadcn@latest add <component-name>`
- Generated components land in `src/components/ui/`.
- The project uses Radix UI primitives under the hood via `radix-ui` package.

---

## Testing Instructions

There are currently **no automated tests** configured for this project. Validate changes manually:

1. Run `npm run lint` to check for linting errors before any commit.
2. Run `npm run build` to ensure no TypeScript or compilation errors.
3. Test auth flows (sign-in, onboarding, protected routes) manually.
4. Verify AI features require valid API keys in `.env`.

---

## Build and Deployment

```bash
npm run build   # Produces an optimized production build in .next/
npm run start   # Serves the production build locally
```

- **Production URL**: `https://prepforge-ten.vercel.app`
- The build uses `experimental.useCache: true` in `next.config.ts` — this enables the Next.js `"use cache"` directive.
- Ensure all environment variables are set in the deployment environment.
- The Next.js version (`16.2.9`) may have APIs that differ significantly from v13/v14/v15 — always check `node_modules/next/dist/docs/` for accurate API references.

---

## Security Notes

- **Arcjet** (`src/proxy.ts`) protects all non-public routes with: bot detection (blocks malicious bots, allows search engines/monitors), rate limiting (100 req/min sliding window), and shield (OWASP protection).
- **Clerk** handles all authentication. Never implement custom auth.
- **Webhooks** at `/api/webhooks/*` are excluded from Clerk middleware (Clerk signs them separately).
- Secrets (API keys, DB URL) must never be committed or logged.

---

## Pull Request Guidelines

- **Branch naming**: `feature/<short-description>`, `fix/<short-description>`, `chore/<short-description>`
- **Commit style**: Conventional Commits — `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`
- **Before submitting**: Run `npm run lint` and `npm run build` — both must pass cleanly.
- Keep PRs focused; one logical change per PR.

---

## Common Gotchas

- **`src/proxy.ts` is the middleware** — not `middleware.ts`. Next.js picks this up via the `matcher` export in that file.
- **Zod v4 breaking changes**: `z.string().nonempty()` and some other APIs changed. Use `z.string().min(1)` instead.
- **`"use cache"` is experimental**: The `useCache: true` flag in `next.config.ts` enables the Next.js `"use cache"` directive — this is different from React's `cache()`. Check Next.js 16 docs for usage.
- **Clerk `@clerk/ui` vs `@clerk/nextjs`**: This project uses both. `@clerk/ui` is for custom UI components; `@clerk/nextjs` provides the provider and hooks. Do not mix their component APIs.
- **Tailwind v4**: Config is in `postcss.config.mjs` — there is no `tailwind.config.ts`. Tailwind v4 uses CSS-first configuration via `@theme` in `globals.css`.
- **Hume voice**: Requires `HUME_API_KEY`, `HUME_SECRET_KEY`, and `NEXT_PUBLIC_HUME_CONFIG_ID`. Voice features will silently fail or error without these.
- **Font**: The project uses the `Outfit` font from Google Fonts loaded via `next/font/google`. Do not add `<link>` tags for fonts.
