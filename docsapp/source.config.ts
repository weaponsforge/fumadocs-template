import { metaSchema, pageSchema } from 'fumadocs-core/source/schema'
import { defineConfig, defineDocs } from 'fumadocs-mdx/config'
import lastModified from 'fumadocs-mdx/plugins/last-modified'
import { z } from 'zod'

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
// `private` is read by fumadocs-routes (`npm run routes:build`) from the raw files,
// where a missing key means "inherit from the parent folder".
export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema.extend({
      private: z.boolean().default(false),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
    async: true,
  },
  meta: {
    files: ['**/meta.json'],
    schema: metaSchema.extend({
      private: z.boolean().default(false),
    }),
  },
})

export default defineConfig({
  mdxOptions: {
    // MDX options
  },
  plugins: [lastModified()],
})
