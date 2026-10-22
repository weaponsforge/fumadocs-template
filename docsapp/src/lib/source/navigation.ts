import {
  SECTION_LABELS,
  SECTION_LIST,
  SECTIONS,
} from '@/lib/routes/routes'

// Section labels from each section's meta.json (or index.mdx) description,
// eg. { characters: 'MU Online characters' }
export const CATEGORY: Record<string, string> = SECTION_LABELS

// Pages outside a known section fall back to this section
const DEFAULT_SECTION = SECTIONS.CHARACTERS ?? SECTION_LIST[0]

export function getSection(path: string | undefined) {
  const [dir] = path?.split('/', 1) ?? []

  return dir && SECTION_LIST.includes(dir)
    ? dir
    : DEFAULT_SECTION
}
