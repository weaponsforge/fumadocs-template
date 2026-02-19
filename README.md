# fumadocs-template

This is a Next.js application generated with
[Create Fumadocs](https://github.com/fuma-nama/fumadocs).

### 📋 Requirements

1. NodeJS v24
   ```text
   Recommended version (used within this project)
   node v24.11.0
   npm v11.6.1
   ```

2. Docker (optional)

### 📖 Run development server

```bash
# Navigate to the /docsapp directory
cd docsapp

npm run dev
# or
pnpm dev
# or
yarn dev
```

Open http://localhost:3000 with your browser to see the result.

### ⚡ Quickstart

Using Docker

1. Set up the environment variables for in the `/docsapp` directory. Refer to the [Environment Variables](#environment-variables) for more information.

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

Create a `.env.local` file from the `.env.example` file.

| Variable | Description |
| --- | --- |
| IS_BUILD_STATIC | If value is `1`, builds and exports the NextJS app into a static build in the `/nextapp/out` directory when running `"npm run build"` |
| IS_BUILD_DOCKER | Flag to build the NextJS app for Docker in production using the standalone mode build. | `true`, builds and exports the NextJS app into a static build in the `/out` directory when running `"npm run build"` |
