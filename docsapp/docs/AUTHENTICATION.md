# Authentication System Guide

## 🟢 Overview

This application uses [Better Auth](https://better-auth.com/) with **Google OAuth Sign-in** for authentication.
The authentication system is designed around a layered approach:
- **Better Auth** manages authentication and sessions.
- **Google OAuth** verifies user identity.
- **`isEmailAllowed()`** is the single allowlist check (email + domain), used by both layers below.
- **`user.validateUserInfo()`** calls it to perform authorization before session creation.
- **Better Auth's OAuth callback** redirects rejected sign-ins to the `errorCallbackURL` set by the auth client.
- **`proxy.ts`** (Next.js middleware, renamed from `middleware.ts` in Next.js 16) calls it again via `isActiveUserAllowed()` to protect private routes (defense-in-depth).
> [!NOTE]
> The main goal is:
> Authenticate users securely while ensuring only approved Google accounts can access protected application features.

## 🟢 Architecture Overview
```text
                 Google OAuth
                      |
                      ▼
              Better Auth Callback
                      |
                      ▼
             Google User Information
                      |
                      ▼
              Authorization Check
                      |
        ┌─────────────┴─────────────┐
        │                           │
     Allowed                    Denied
        │                           │
        ▼                           ▼
 Create Session               Access Denied
        │
        ▼
 Protected Routes
```
This design provides a clean, maintainable authentication foundation that future developers can extend without mixing authentication, authorization, and routing responsibilities.

## Authentication Flow
### 1. User Initiates Sign-in
Users can start authentication from:
- Public pages: eg., `/docs`
- Protected pages eg., `/docs/secrets/map`

For protected routes, unauthenticated users are redirected to: `/auth/signin`<br>
Example: `/auth/signin?code=signin&callbackURL=/docs/secrets/map`

The sign-in button calls `signIn()` from `features/auth/lib/client.ts`, which starts the Better Auth social sign-in:
```typescript
signIn.social({
  provider: 'google',
  callbackURL,
  errorCallbackURL: AUTH_ROUTES.ACCESS_DENIED_FULL, // /auth/error?error=AccessDenied
})
```

### 2. Google OAuth Authentication
**Better Auth** redirects users to Google using its built-in Google provider, configured in `features/auth/lib/auth.ts` under `socialProviders.google`. No custom `getUserInfo()` override is used — Better Auth fetches and maps the Google profile itself:
```text
Google ID
Email
Name
Profile Image
Email Verification Status
```
If `ALLOWED_EMAIL_DOMAINS` contains a single domain, it is also passed to Google as the `hd` (hosted domain) parameter so the account picker only shows accounts from that domain. This is a UX hint only — the allowlist check below is what enforces access.

### 3. Authorization Before Session Creation
The most important security decision happens inside `features/auth/lib/auth.ts` ⟶ `user.validateUserInfo()`.
```text
features/auth/lib/auth.ts
└── user.validateUserInfo({ user })
      └── isEmailAllowed(user.email)
```
It validates the Google account against the shared allowlist (email + domain) before a session is created. On rejection it returns (rather than throws) an error object:
```typescript
return {
  error: AUTH_ERROR.ACCESS_DENIED,          // 'AccessDenied'
  errorDescription: B_STATUS_CODES.FORBIDDEN, // 'FORBIDDEN'
}
```

> `validateUserInfo` is Better Auth's provisioning gate. It runs on every OAuth path that would produce a session — first-time signup (`create-user`), repeat sign-in by a known user (`sign-in`), and account linking (`link-account`) — so it covers the cases that `mapProfileToUser` (mapping only, cannot reject) and `databaseHooks.user.create.before` (first-time signup only) don't. It also fails closed: if the callback throws, Better Auth rejects the sign-in.

Example flow:
```text
Google Profile Received
          |
          ▼
isEmailAllowed(email)
          |
    ┌─────┴─────┐
    │           │
 Allowed     Denied
    │           │
    ▼           ▼
Continue    Return { error: 'AccessDenied' }
Login       (Better Auth throws 403 APIError)
```

#### Why validate here?
The authorization check happens before **session** creation.
This prevents:
- unauthorized sessions
- unnecessary session cleanup
- temporary access before logout

✅ Preferred flow:
```text
Authenticate ⟶ Authorize ⟶ Create Session
```
❌ Avoid:
```text
Authenticate ⟶ Create Session ⟶ Check Authorization ⟶ Logout
```

### 4. Handling Access Denied Errors
`/api/auth/[...all]/route.ts` exports the stock Better Auth handlers with no custom error handling:
```typescript
export const { GET, POST } = toNextJsHandler(auth)
```
When `validateUserInfo()` rejects, Better Auth throws a `FORBIDDEN` `APIError` whose `code` is `AccessDenied`. Its OAuth callback catches that error and redirects to the `errorCallbackURL` passed by the client in step 1, appending `error` / `error_description` query params. This keeps:
- authorization logic in `features/auth/lib/auth.ts`
- redirect target in the auth client (`features/auth/lib/client.ts`)

Flow:
```text
validateUserInfo()
      |
      ▼
return { error: 'AccessDenied' }
      |
      ▼
Better Auth OAuth callback ⟶ APIError(FORBIDDEN)
      |
      ▼
Redirect to errorCallbackURL
/auth/error?error=AccessDenied
```

> [!IMPORTANT]
> The redirect target comes from `errorCallbackURL`. A sign-in started without it (e.g. not via `signIn()` in `lib/client.ts`) falls back to Better Auth's default error page (`<baseURL>/error`) instead of `/auth/error`.

### 5. Successful Authentication - Session Creation
If the Google account is allowed, the **session** becomes the source of truth for future requests.
```text
Google Profile
      |
      ▼
Better Auth creates user/session
      |
      ▼
Session Cookie Created
      |
      ▼
User Authenticated
```
---
## 🟢 Protected Route Handling
> 💡 Protected routes are enforced in `proxy.ts`, the Next.js middleware that runs before App Router pages, Server Components, and route handlers render.

The proxy checks every incoming request with `RouteHandler.isPrivateRoute(pathname)` (from `@/lib/routes`).
```text
Request
   ⭣
Is this a private route?
   |
   ├── No
   │     ⭣
   │ Continue
   |
   └── Yes
          ⭣
     Check session
```

>💡 **Note on proxy scope:** `proxy.ts` performs a full session decode + allowlist check on every private-route request, rather than a lightweight cookie-existence check. This is intentional: `getAuthSession()` reads only the signed session cookie — no DB or store lookup — so the per-request cost stays low enough to justify the stronger guarantee (a user removed from the allowlist loses access on their *next* request, not just their next login). If `getAuthSession()` ever starts hitting a DB/session store, this tradeoff should be revisited.

App Router route handlers that serve LLMs content (`/llms.txt`, `/llms-full.txt`, `/llms.mdx`) and search (`/api/search`) also check the session on the server, independent of `proxy.ts`. They serve all docs (`source`) when Google OAuth is not configured or the session user is allowed, and only public docs (`publicSource`) otherwise, matching the proxy's open-access behavior.

### No Session
If the user is not authenticated:
```text
/private-route
      ⭣
/auth/signin?code=signin&callbackURL=/private-route
```

### Invalid Authorization
Even though unauthorized users should never receive sessions, the proxy performs an additional authorization check.
Flow:
```text
Session exists
       |
       ▼
isActiveUserAllowed(session)
       |
       ├── allowed
       │       |
       │       ▼
       │    Continue
       |
       └── denied
               |
               ▼
        /auth/error?error=AccessDenied
```

## 🟢 Session in the UI (Client-side)

Shared layouts (`lib/layout.shared.tsx` ⟶ `app/(home)/layout.tsx`, `app/docs/layout.tsx`) do **not** read the session on the server. Calling `getAuthSession()` there reads request headers, which forces every page into dynamic rendering.

Instead, the sign-out widget resolves the session in the browser:
```text
baseOptions()  (sync, no session)
      |
      ▼
<SignOutLink />  ('use client')
      |
      ▼
useSession()  ⟶  /api/auth/get-session
      |
      ├── pending or no session ⟶ render nothing
      └── session               ⟶ <SignOutButton> with email + avatar
```
- `useSession` comes from the Better Auth **React** client (`better-auth/react`) in `features/auth/lib/client.ts`.
- The widget is only mounted when `GOOGLE_AUTH_CONFIGURED` is true.
- This is a **display concern only**. Access control still happens server-side in `proxy.ts` and the route handlers — never gate content with `useSession()`.

> Keep `baseOptions()` and the layouts synchronous and free of `headers()` / `cookies()` / `getAuthSession()` calls, or the layouts become dynamic again. Pages that genuinely need the session server-side (e.g. `app/(home)/page.tsx`) can still call `getAuthSession()` directly.

## 🟢 Route Protection Configuration

### Marking content private

Privacy is set in the content itself, never in code:
- **Folders:** `"private": true` in a folder's `meta.json` makes that folder and everything nested in it private.
- **Pages:** `private: true` / `private: false` in a page's frontmatter overrides its folder.

Rules:
1. The **nearest** `meta.json` that explicitly sets `private` wins over its ancestors, e.g. `classes/meta.json: true` + `classes/wizards/meta.json: false` makes `wizards/` public.
2. A page's frontmatter `private` overrides its folder.
3. **Only explicitly written values count.** A nested `meta.json` without a `private` key (e.g. one added just for sidebar ordering) inherits from its parent; it does not reset the subtree to public. The zod schemas in `source.config.ts` default `private` to `false` for runtime typing only.
4. A non-boolean `private` value fails the generator with the file path.
5. `"private": true` in the root `content/docs/meta.json` makes the whole site private.

Current content: `secrets/` and `stats-calculator/` are private, `secrets/index.mdx` and `secrets/skill-tips.mdx` are public pages inside it, and `characters/(classes)/elf.mdx` is a private page in a public section.

### Generated route lists

The [`fumadocs-routes`](https://github.com/weaponsforge/fumadocs-routes) CLI (dev dependency, run by `npm run routes:build`) reads the raw `meta.json` files and frontmatter under `content/docs` and writes `.source/docs-routes.json` (gitignored, always regenerated). `lib/routes/routes.ts` imports it as `collections/docs-routes.json`:
- `sections` / `section_labels`: folders served at `/docs/<folder>` (top-level, or inside a top-level `(group)`) whose `meta.json` has `root: true`; nested `root: true` folders are not sections. Labels come from the `meta.json` `description`, else the `index.mdx` `description`, else the slug
- `private_sections`: URL prefixes of the topmost private non-group folders (can be nested, e.g. `characters/wizards`)
- `public_exceptions`: exact slugs of public pages under a private prefix
- `private_pages`: exact slugs of private pages not covered by a private prefix, e.g. a private page in a public section, or pages of a private `(group)` folder (groups add no URL segment, so they can't be prefixes)

It runs automatically on `postinstall` and at the start of `dev`, `build` (covers `docker:build`) and `docker:webpack`. `npm run routes:check` (`--strict`) runs at the start of `lint` and `types:check`; in strict mode a top-level `content/docs` folder without a `meta.json` is an error instead of a warning. Keep `--strict` out of build/deploy scripts.

> 💡 **Dev note:** after editing a `private` flag while `next dev` is running, re-run `npm run routes:build` and Next hot-reloads the JSON, or restart `npm run dev`, which regenerates it on start.

### Private Routes

`/lib/routes/routes.ts` imports the generated JSON and exposes:
- `SECTIONS`, `SECTION_LIST`, `SECTION_LABELS` — the docs sections and their labels (used by `lib/source/navigation.ts`, e.g. for `llms.txt` headings)
- `PRIVATE_SECTIONS` — private URL prefixes, along with every route under them
- `PRIVATE_ROUTES` — derived from `PRIVATE_SECTIONS`. Each prefix expands to its `/docs/<prefix>` and `/llms.mdx/<prefix>` forms, plus the `.mdx` variant of each.
- `PUBLIC_EXCEPTIONS` — exact canonical paths that stay public inside a private prefix, e.g. `/docs/secrets`, `/docs/secrets/skill-tips`
- `PRIVATE_PAGES` — exact canonical private paths outside the private prefixes, e.g. `/docs/characters/elf`

`/lib/routes/index.ts` exports `RouteHandler`, a `RouteUtil` instance (`/lib/routes/routeUtil.ts`) built from `PRIVATE_ROUTES`. Its `isPrivateRoute(pathname)` is the single private-route check, used by:
- `proxy.ts` — request protection
- `lib/sourceBuilder.tsx` — splitting the docs source into public and private content (`publicSource` uses `buildCustomSource({ isPrivate: false })`). A folder's `index` page and `meta.json` are checked against the folder route.

Before matching, `isPrivateRoute()` normalizes `/llms.mdx/...` paths, `.mdx` suffixes and OG image paths (`/og/<slug>/image.webp`) to the canonical `/docs/...` form. A route is private when its canonical path equals a private prefix or falls under one and is not a public exception, or when it is one of the `PRIVATE_PAGES`.

The proxy never loads the content source: it only reads these generated lists, so its cost doesn't grow with the amount of content, and unknown URLs under a private prefix are gated the same as existing ones (no leaking which private slugs exist).

OG images (`/og/[...slug]/image.webp`) are prerendered for every page and show its title and description. The proxy matcher skips `.webp` assets, so it has a separate `/og/:path*` entry: a private page's OG image is gated like the page itself (open when Google auth isn't configured), while public ones only cost a string check.

### Public Routes

All routes outside `PRIVATE_SECTIONS` and `PRIVATE_PAGES`, plus the `PUBLIC_EXCEPTIONS`, remain publicly accessible eg.,
```text
/
/docs
/docs/characters
/docs/weapons
/docs/secrets             (public exception)
/docs/secrets/skill-tips  (public exception)
```
> A user who fails authentication can still browse public content.


## 🟢 Authentication Components

### `/lib/utils.ts` — `isEmailAllowed()`

Responsibility:
- Single source of truth for the allowlist: checks email + domain
- Normalizes input (lowercase/trim) internally — callers pass raw values
- Called from both `features/auth/lib/auth.ts` (pre-session) and `lib/session.ts` (post-session)

### `/features/auth/lib/auth.ts`

Responsibility:
- Configure **Better Auth**
- Configure Google OAuth
- Call `isEmailAllowed()` in `user.validateUserInfo()`; reject unauthorized users

Should NOT handle:
- route redirects
- page rendering
- middleware logic

> `/lib/auth.ts` only re-exports `auth` from `@/features/auth/server`, since Better Auth's tooling expects a `lib/auth.ts` file. Don't add config there.

### `/features/auth` entrypoints

| Import from | Contains | Use in |
| --- | --- | --- |
| `@/features/auth` | UI components, `signIn` / `signOut`, constants | client & shared code |
| `@/features/auth/server` | `auth` instance, routing constants | server code only (`proxy.ts`, `lib/auth.ts`) |

`features/auth/lib/auth.ts` imports `server-only`, so pulling it into a client bundle fails the build. Never re-export `auth` from the client barrel.

### `/features/auth/lib/client.ts`

Responsibility:
- Create the Better Auth React client (`better-auth/react`)
- Expose `signIn()` / `signOut()` / `useSession()`
- Set `errorCallbackURL` so rejected sign-ins land on `/auth/error?error=AccessDenied`

### `/features/auth/components/SignOutButtonWrapper.tsx` (`SignOutLink`)

Responsibility:
- Client component that reads the session via `useSession()` and renders the sign-out button (see [Session in the UI](#-session-in-the-ui-client-side))

### `/api/auth/[...all]/route.ts`

Responsibility:
- Expose Better Auth API routes (`toNextJsHandler(auth)`)

Should NOT handle:
- user authorization rules
- route protection
- error redirects (handled by Better Auth + `errorCallbackURL`)

### `proxy.ts`

Responsibility:
- Protect private routes (via `RouteHandler.isPrivateRoute()`)
- Redirect unauthenticated users
- Call `isActiveUserAllowed()` for session authorization

Should NOT handle:
- OAuth callbacks
- Google profile validation

## 🟢 Security Model

The application uses multiple authorization layers, each layer has a specific responsibility.
```text
                 Google OAuth
                      |
                      ▼
          Identity Verification
                      |
                      ▼
        Email Allowlist Validation
                      |
                      ▼
              Session Creation
                      |
                      ▼
             Route Authorization
```

## 🟢 Extending the Authentication System

### A. Adding more allowed users

Update the allowlist source: `isEmailAllowed()` in `/lib/utils.ts`, which reads `getAllowedEmails()` (`ALLOWED_EMAILS` env var) and `getMultipleHostedDomains()` (`ALLOWED_EMAIL_DOMAINS` env var). An empty list on either check allows all — set explicitly to restrict.

Potential expansions could use:
- database table
- admin-managed users table

### B. Supporting additional OAuth providers

- Add another provider under `socialProviders` in `features/auth/lib/auth.ts`.
- Example: google, github, microsoft

No per-provider authorization code is needed: `user.validateUserInfo()` is global, so every provider's profile goes through the same `isEmailAllowed()` rule:
```text
Provider Profile
        |
        ▼
validateUserInfo ⟶ isEmailAllowed(user.email)?
        |
        ▼
Create Session
```
Make sure the client's sign-in call for the new provider also passes `errorCallbackURL`.

## 🟢 Important Design Decisions

### Why validate before session creation?

Because unauthorized users should never become authenticated users.

Preferred:
```text
Authenticate ⟶ Authorize ⟶ Create Session
```
Avoid:
```text
Authenticate ⟶ Create Session ⟶ Check Authorization ⟶ Logout
```

### Why Better Auth - `validateUserInfo` instead of a custom `getUserInfo`?
Earlier versions overrode the Google provider's `getUserInfo()` to fetch the profile manually and throw an `APIError`, which required a wrapper around the `/api/auth` route handlers to turn that error (sometimes thrown, sometimes a serialized `403`) into a redirect. `validateUserInfo` is Better Auth's built-in gate: it is provider-agnostic, runs on signup, sign-in and account linking, and its rejections are redirected by Better Auth itself — so both the custom profile fetch and the route wrapper were removed.

### Why keep authorization checks in proxy.ts?

Even though OAuth validation already exists, `proxy.ts`:
- protects future changes
- prevents accidental bypasses
- provides centralized route protection

### Why one shared `isEmailAllowed()` instead of two separate checks?
The Better Auth config and `session.ts` previously implemented the allowlist independently, which let their empty-list ("no restriction set") behavior silently diverge. A single shared function, called from both layers, guarantees they can't drift out of sync again.


## 🟢 Developer Checklist

When modifying authentication:

- [ ] Update `features/auth/lib/auth.ts` for identity/provider changes (not `lib/auth.ts`, which is a re-export)
- [ ] Import server-only auth code from `@/features/auth/server`, never from the client barrel `@/features/auth`
- [ ] Keep shared layouts static: read the session in UI via `useSession()`, not `getAuthSession()`
- [ ] Update `isEmailAllowed()` in `lib/utils.ts` - `ALLOWED_EMAILS` / `ALLOWED_EMAIL_DOMAINS` .env variables for allowlist rules
- [ ] Update `errorCallbackURL` in `features/auth/lib/client.ts` for auth error redirects
- [ ] Set `private` in the folder's `meta.json` or the page's frontmatter (never edit the route lists by hand), then run `npm run routes:build` (`proxy.ts`, the docs source and `lib/source/navigation.ts` pick up the generated lists automatically)
- [ ] Keep public routes accessible
- [ ] Never expose protected pages only through client-side checks
- [ ] Verify that `/llms.txt`, `/llms-full.txt`, `/llms.mdx` and `/og` properly expose public/private content
