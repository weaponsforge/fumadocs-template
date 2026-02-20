# fumadocs-template

This is a Next.js application generated with
[Create Fumadocs](https://github.com/fuma-nama/fumadocs).

It features basic setup, configurations, sign-in authentication, and tooling to standardize using Fumadocs as a template.

### 📋 Requirements

#### 1. NodeJS v24

```text
Recommended version (used within this project)
node v24.11.0
npm v11.6.1
```

#### 2. Google OAuth2 Client (optional)

- This requires a Google Cloud Platform project configured with [OAuth2](https://developers.google.com/workspace/guides/configure-oauth-consent) settings and [credentials](https://developers.google.com/workspace/guides/manage-credentials).
- Read on the Google [Gmail](https://developers.google.com/gmail/api/guides), [SMTP and OAuth2 Setup](https://github.com/weaponsforge/email-sender?tab=readme-ov-file#using-the-oauth-20-playground) sections for more information.
- Retrieve the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variable values here.

<br>

> 💡 **INFO**: Setup required only if you want to enable Google sign-in

3. Docker (optional)

### 📖 Run development server

#### 1. Navigate to the `/docsapp` directory

```sh
cd nextapp
```

#### 2. Install dependencies.

```sh
npm install
```

#### 3. Run the app

```bash
npm run dev
```

#### 4. Launch the local website.

Open http://localhost:3000 with your browser to see the result.

> [!NOTE]
> Look over the [Ennvironment Variables](#environment-variables) section for more building and Authentication options.

<br>



## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

<br>

## ⚡ Quickstart

Using Docker

1. Set up the environment variables in the `/docsapp` directory. Refer to the [Environment Variables](#environment-variables) for more information.

2. Build the image for local development..<br>
   ```sh
   docker compose build --no-cache
   ```

3. Run the container for local development.<br>
   ```sh
   docker compose up
   ```

Open http://localhost:3000 with your browser to see the result.

## Explore

> [!NOTE]
> The Fumadocs app lives inside the `/docsapp` directory.
> All files and folders referenced in the following sections are relative to the `/docsapp` directory.

In the project, you can see:

- `lib/source.ts`: Code for content source adapter, [`loader()`](https://fumadocs.dev/docs/headless/source-api) provides the interface to access your content.
- `lib/layout.shared.tsx`: Shared options for layouts, optional but preferred to keep.

| Route                     | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| `app/(home)`              | The route group for your landing page and other pages. |
| `app/docs`                | The documentation layout and pages.                    |
| `app/api/search/route.ts` | The Route Handler for search.                          |

### Fumadocs MDX

A `source.config.ts` config file has been included, you can customise different options like frontmatter schema.

Read the [Introduction](https://fumadocs.dev/docs/mdx) for further details.

## Learn More

To learn more about Next.js and Fumadocs, take a look at the following
resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js
  features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Fumadocs](https://fumadocs.dev) - learn about Fumadocs

## Environment Variables

> [!WARNING]
> Ensure only one of `IS_BUILD_STATIC` or `IS_BUILD_DOCKER` has a value of `1` to avoid build conflicts.

Create a `.env.local` file from the `.env.example` file.

| Variable | Description |
| --- | --- |
| GOOGLE_CLIENT_ID | Google OAuth2 client ID linked with your Google Cloud Platform project. |
| GOOGLE_CLIENT_SECRET | Google OAuth2 client secret associated with the `GOOGLE_CLIENT_ID` |
| NEXTAUTH_SECRET | Your nextauth secret (any random string will do) |
| NEXTAUTH_URL | Your root domain URL |
| ALLOWED_EMAIL_DOMAINS | Allowed Google email domains to sign-in with Google eg., `gmail.com`, `company.com`.<br><quote>Leave it blank or unset if you want to allow sign-in from all Google accounts.</quote> |
| ALLOWED_EMAILS | Hard-coded list of comma-separated emails allowed to sign-in with Google. |
| IS_BUILD_DOCKER | If value is `1`, builds the NextJS app for Docker in production using the standalone mode build into the `/nextapp/.next/standalone` and `/nextapp/.next/static` directories. |
| IS_BUILD_STATIC | If value is `1`, builds and exports the NextJS app into a static build in the `/nextapp/out` directory when running `"npm run build"`<br><br>⚠️ Fumadocs (or any Next.js) app that uses heavy React Server Components (RSC) and Next.js server features will fail to build as a static output. Te enable true static export, [adjust necessary settings](https://nextjs.org/docs/app/guides/static-exports) in the `next.config.mjs` file and the overall app before export. |

@weaponsforge<br>
20251118<br>
20260220
