import { loader } from 'fumadocs-core/source'
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons'

import { docs } from 'collections/server'

import { docsContentRoute, docsImageRoute, docsRoute } from '@/lib/constants'
import { PRIVATE_ROUTES } from '@/lib/shared'
import { buildCustomSource } from '@/lib/sourceBuilder'

// See https://fumadocs.dev/docs/headless/source-api for more info
// All docs sources
export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
})

// All docs sources excluding those in the private routes
export const publicSource = loader(buildCustomSource({
  excludedRoutes: PRIVATE_ROUTES,
}), {
  baseUrl: 'docs',
})

export function getPageImage(page: (typeof source)['$inferPage']) {
  const segments = [...page.slugs, 'image.png']

  return {
    segments,
    url: `${docsImageRoute}/${segments.join('/')}`,
  }
}

export function getPageMarkdownUrl(page: (typeof source)['$inferPage']) {
  const segments = [...page.slugs, 'content.md']

  return {
    segments,
    url: `${docsContentRoute}/${segments.join('/')}`,
  }
}

export async function getLLMText(page: (typeof source)['$inferPage']) {
  const processed = await page.data.getText('processed')
  const isDescription = typeof page?.data?.description === 'string'

  return `# ${page.data.title} (${page.url})` +
    (isDescription ? `\n\n${page?.data?.description}` : '') +
    processed
}

export type Meta = (typeof source)['$inferPage'];
export type Page = (typeof source)['$inferMeta'];
