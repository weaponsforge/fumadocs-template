<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## AGENTS.md

This file gives agents guidance for working with code in this repository.

## Project overview

A Fumadocs documentation template built on the Next.js App Router, React Server Components, and Next.js middleware, with Google OAuth–gated private sections, LLM-friendly markdown routes, OG image generation, and PWA support. This directory (`docsapp/`) is the only app and a subfolder of a root project. The root directory holds meta files and the Docker Compose files (`docker-compose.yml`, `docker-compose.prod.yml`, `docker-compose.static.yml`), which aren't visible from here. Developer docs live in `docs/`, not to be confused with the site content in `content/docs/`. The `content/docs/` pages are sample MU Online game docs.

## Commands

Run npm commands from this directory, `docsapp/`:

```bash
npm run dev           # next dev --turbo
npm run build         # production build (also the closest thing to a test)
npm run lint:fix      # ESLint autofix (ESLint is the only formatter; no Prettier)
npm run lint          # must pass before committing (CI)
npm run types:check   # regenerates .source/ (fumadocs-mdx) + next typegen + tsc --noEmit; must pass (CI)
```

No test framework is configured.

### Docker (optional)

- Docker is optional. The default local workflow is `npm install` then `npm run dev` in this directory (http://localhost:3000). Docker is an alternative for local development and for production deployments outside Vercel. Its environment variables still come from `.env.local` in this directory.
- Run `docker compose` commands from the root project directory (the parent of `docsapp/`), not from here. Compose files: `docker-compose.yml` (dev), `docker-compose.prod.yml`, `docker-compose.static.yml`.
- Docker dev, from the root: `docker compose build --no-cache && docker compose up`. On Windows, set `IS_WEBPACK=1` + `WATCHPACK_POLLING=true` for hot reload.

## Tech stack

- **Node.js v24+** (the Dockerfile pins `node:24.11.0-alpine`)
- **Next.js 16** (App Router). Middleware lives in `src/proxy.ts`, Next 16's rename of `middleware.ts`; don't create a `middleware.ts`.
- **React 19** (Server Components) with **TypeScript** (strict mode)
- **Fumadocs**: fumadocs-core/ui 16 + fumadocs-mdx 15 (versions pinned)
- **Tailwind CSS 4** (CSS-first in `src/app/global.css`, no tailwind.config) + Lucide icons
- **Better Auth** with Google OAuth
- **takumi-js** for OG images
- **npm** as the package manager

## Architecture

### Server Components and middleware

- Everything under `src/app/` is a Server Component unless it starts with `"use client"`. Pages, layouts, and route handlers load content and sessions on the server (`source.getPage()`, `getAuthSession()`).
- `"use client"` is only for interactive leaves (auth buttons, sign-in/error pages, PWA registration). Keep it that way: don't move data loading or session checks into client components, and don't import `server-only` modules or `@/features/<name>/server` from them.
- `src/proxy.ts` (middleware) runs before every page, Server Component, and route handler that its `matcher` covers. It handles auth redirects and the markdown/LLM URL rewrites. `/api/*` and static assets are excluded from the matcher, so API route handlers must do their own auth checks.

### Content and data flow

- MDX in `content/docs/` → `fumadocs-mdx` (runs on postinstall/dev/types:check) generates `.source/` (gitignored, imported as `collections/*`) → loaders in `src/lib/source/index.ts`:
  - `source`: all pages
  - `publicSource`: pages that are not private (filtered by `src/lib/sourceBuilder.tsx` via `RouteHandler.isPrivateRoute`)
- Aggregate endpoints (`/api/search`, `/llms.txt`, `/llms-full.txt`) pick `source` or `publicSource` depending on whether the session user is allowed. Any new endpoint that lists or aggregates content must do the same, or private content leaks.
- `/docs/x.mdx` and `Accept: text/markdown` requests are rewritten by `proxy.ts` to `/llms.mdx/[...slug]`. OG images are served at `/og/[...slug]`.

### Content creation

- Frontmatter: `title`, `description`, `icon` (a Lucide icon name).
- Sidebar order comes from `meta.json` `pages` arrays. These support `"---Label---"` separators, `"...(folder)"` spreads, and `"..."` for the remaining pages. Parenthesised folders like `(guide)` are Fumadocs groups and add no URL segment.
- New page: add an `.mdx` file to `content/docs/<section>/` and list it in that section's `meta.json` if `pages` is explicit.
- New section requires **all** of:
  1. `content/docs/<section>/index.mdx` + `meta.json` (`title`, `root: true`, `description`, `icon`, `pages`)
  2. Add it to the root `content/docs/meta.json`
  3. Add it to `SECTIONS` in `src/lib/routes/routes.ts`
  4. Add it to `CATEGORY` and the `getSection()` map in `src/lib/source/navigation.ts`. Unknown sections silently fall back to `characters`.
  5. If auth-gated: add it to `PRIVATE_SECTIONS`. Public pages inside a private section go in `PUBLIC_EXCEPTIONS` as exact canonical paths (no `.mdx` or `/llms.mdx`).

### Authentication

- `proxy.ts` gates `PRIVATE_ROUTES`: unauthenticated users go to sign-in, and users who aren't allowed go to access-denied. Doc pages themselves don't re-check auth.
- Allowlisting uses `ALLOWED_EMAIL_DOMAINS` / `ALLOWED_EMAILS`.
- If `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are unset, `GOOGLE_AUTH_CONFIGURED` is false and **all private routes are open**. This is the local default.
- Private images live in `protected/` and are served via `src/app/api/protected-asset/[...path]`. Public assets go in `public/`.
- When changing auth code (`src/features/auth`, `src/lib/session.ts`, `src/lib/routes/`, `proxy.ts`), update `docs/AUTHENTICATION.md` in the same change.

## Conventions

- Style (enforced by `eslint.config.mjs`): no semicolons, single quotes (double in JSX attributes), 2-space indent, trailing commas, a blank line before `return`. `no-console` except `warn`/`error`. Unused vars need a `_` prefix.
- Feature imports go through the barrel only: `@/features/<name>` (client-safe) or `@/features/<name>/server` (server-only). Deep imports are a lint error. Never export server-only code (e.g. the Better Auth instance) from the client barrel.
- `import/order` groups: builtin → external (react, next first) → `@/components` → `@/hooks`, `@/lib`, `@/**` → relative → type imports. Separate groups with blank lines and sort alphabetically.
- Env: copy `.env.example` to `.env.local`. `IS_BUILD_DOCKER=1` (standalone) and `IS_BUILD_STATIC=1` (export) are mutually exclusive, and next.config throws if both are set. `.env.example` ships with `IS_BUILD_DOCKER=1`.
- Git: branch from `dev` (`feat/…`, `fix/…`, `perf/…`) and open PRs against `dev`; `master` is production. Use Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`). Keep PRs to about 700 changed lines. New features need an approved Feature Request issue first.

## Context files

Read these before working on the related area:

- [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md): auth architecture, sign-in flow, route protection config, security model, and developer checklist
- [docs/GOOGLE_OAUTH.md](docs/GOOGLE_OAUTH.md): setting up the Google Cloud OAuth client (credentials, redirect URI)
