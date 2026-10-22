import generatedDocsRoutes from 'collections/docs-routes.json'

import { toConstKey } from '@/lib/utils'

export const DOCS_ROUTE = '/docs'
export const OG_ROUTE = '/og'
export const LLMS_MDX_ROUTE = '/llms.mdx'

export const DOCS_ROUTE_SEGMENT = 'docs'
export const OG_ROUTE_SG = 'og'
export const LLMS_MDX_ROUTE_SEGMENT = 'llms.mdx'

/**
 * Converts a docs-relative slug to its canonical `/docs/...` path.
 * The root slug `''` maps to `/docs`.
 */
const toDocsPath = (slug: string) => slug
  ? `/${DOCS_ROUTE_SEGMENT}/${slug}`
  : `/${DOCS_ROUTE_SEGMENT}`

const sectionRoutes = (section: string): string[] => {
  const subRoute = section ? `/${section}` : ''

  return [
    `/${DOCS_ROUTE_SEGMENT}${subRoute}`,
    `/${DOCS_ROUTE_SEGMENT}${subRoute}.mdx`,
    `/${LLMS_MDX_ROUTE_SEGMENT}${subRoute}`,
  ]
}

// Generated from content/docs/ by fumadocs-routes (`npm run routes:build`).
// Never edit these lists by hand: set `private` in a
// folder's meta.json or a page's frontmatter instead.
const docsRoutes = generatedDocsRoutes

// Main documentation sections: top-level folders under /docsapp/content/docs/
// whose meta.json has `root: true`
export const SECTION_LIST = docsRoutes.sections

// Readable section labels, from the section's meta.json or index.mdx description
export const SECTION_LABELS = docsRoutes.section_labels

// Main documentation section key names
// eg. { CHARACTERS: 'characters', STATS_CALCULATOR: 'stats-calculator' }
export const SECTIONS: Record<string, string> = Object.fromEntries(
  SECTION_LIST.map((section) => [toConstKey(section), section]),
)

// Docs-relative URL prefixes that are private, along with all routes under them
export const PRIVATE_SECTIONS = docsRoutes.private_sections

// Exact paths carved out of an otherwise-private section.
// Canonical form only — no /llms.mdx or .mdx suffix needed here.
export const PUBLIC_EXCEPTIONS = docsRoutes.public_exceptions.map(toDocsPath)

// Exact private paths outside the private sections, eg. a private page in a public section.
// Canonical form only — no /llms.mdx or .mdx suffix needed here.
export const PRIVATE_PAGES = docsRoutes.private_pages.map(toDocsPath)

export const PRIVATE_ROUTES = [
  ...PRIVATE_SECTIONS.flatMap(sectionRoutes),
]
