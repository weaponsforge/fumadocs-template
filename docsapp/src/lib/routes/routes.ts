export const DOCS_ROUTE = '/docs'
export const OG_ROUTE = '/og'
export const LLMS_MDX_ROUTE = '/llms.mdx'

export const DOCS_ROUTE_SEGMENT = 'docs'
export const OG_ROUTE_SG = 'og'
export const LLMS_MDX_ROUTE_SEGMENT = 'llms.mdx'

// Corresponds to the main documentation sections (folder names)
// under /docsapp/content/docs
export const SECTIONS = {
  CHARACTERS: 'characters',
  SECRETS: 'secrets',
  STATS_CALCULATOR: 'stats-calculator',
  WEAPONS: 'weapons',
}

// Sections defined here and all routes under it are private
export const PRIVATE_SECTIONS = [
  SECTIONS.SECRETS,
  SECTIONS.STATS_CALCULATOR,
] as const

// Exact paths carved out of an otherwise-private section.
// Canonical form only — no /llms.mdx or .mdx suffix needed here.
export const PUBLIC_EXCEPTIONS = [
  `/${DOCS_ROUTE_SEGMENT}/${SECTIONS.SECRETS}`,
  `/${DOCS_ROUTE_SEGMENT}/${SECTIONS.SECRETS}/skill-tips`,
]

export const sectionRoutes = (section: string): string[] => {
  return [
    `/${DOCS_ROUTE_SEGMENT}/${section}`,
    `/${DOCS_ROUTE_SEGMENT}/${section}.mdx`,
    `/${LLMS_MDX_ROUTE_SEGMENT}/${section}`,
    `/${LLMS_MDX_ROUTE_SEGMENT}/${section}.mdx`,
  ]
}

export const PRIVATE_ROUTES = [
  ...PRIVATE_SECTIONS.flatMap(sectionRoutes),
]
