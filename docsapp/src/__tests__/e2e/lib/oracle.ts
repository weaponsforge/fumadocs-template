import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

import { toDocsUrl } from './urls'
import {
  CANARY_TEXT,
  CONTENT_DIR,
  FRONTMATTER,
  PROTECTED_DIR,
} from '../lib/constants'

export interface IDocsPage {
  /** Canonical URL, eg. `/docs/characters/elf` */
  url: string
  title: string
  isPrivate: boolean
  /** MDX source without the frontmatter */
  body: string
}

const readFrontmatter = (source: string) => {
  return FRONTMATTER.exec(source)?.[1] ?? ''
}

const readFrontmatterKey = (frontmatter: string, key: string) => {
  return new RegExp(`^${key}:\\s*(.*?)\\s*$`, 'm').exec(frontmatter)?.[1]
}

const readMeta = (dir: string): Record<string, unknown> => {
  const metaPath = join(dir, 'meta.json')

  return existsSync(metaPath)
    ? JSON.parse(readFileSync(metaPath, 'utf8'))
    : {}
}

const toBoolean = (value: unknown) => {
  if (value === true || value === 'true') return true
  if (value === false || value === 'false') return false

  return undefined
}

const walk = (dir: string, inheritedPrivate: boolean): IDocsPage[] => {
  const folderPrivate = toBoolean(readMeta(dir).private) ?? inheritedPrivate

  return readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => {
      const fullPath = join(dir, entry.name)

      if (entry.isDirectory()) return walk(fullPath, folderPrivate)
      // fumadocs-mdx loads both, so a `.md` page is served like an `.mdx` one
      if (!/\.mdx?$/.test(entry.name)) return []

      const source = readFileSync(fullPath, 'utf8')
      const frontmatter = readFrontmatter(source)
      const pagePrivate = toBoolean(readFrontmatterKey(frontmatter, 'private'))

      return [{
        url: toDocsUrl(fullPath),
        title: readFrontmatterKey(frontmatter, 'title') ?? '',
        isPrivate: pagePrivate ?? folderPrivate,
        body: source.replace(FRONTMATTER, ''),
      }]
    })
}

/**
 * Lists every docs page with its resolved privacy
 */
export const getDocsPages = (): IDocsPage[] => {
  return walk(CONTENT_DIR, false)
}

const listFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(dir, entry.name)

    return entry.isDirectory() ? listFiles(fullPath) : [fullPath]
  })

/**
 * Lists the auth-gated assets as `/api/protected-asset/...` URLs
 */
export const getProtectedAssetUrls = (): string[] =>
  listFiles(PROTECTED_DIR).map((file) =>
    `/api/protected-asset/${relative(PROTECTED_DIR, file).split(sep).join('/')}`,
  )

/**
 * Returns lines of plain prose from a page body, headings included
 */
export const toProseLines = (body: string): string[] =>
  body
    .split(/\r?\n/)
    .map((line) => line.replace(/^#+\s*/, '').trim())
    .filter((line) => CANARY_TEXT.test(line))

/**
 * Returns text unique to a private page: its prose lines that don't appear in any
 * public page, meta.json or page title, which may all be shown to anonymous users.
 * A leak of the page's content would show up as one of these lines.
 */
export const getPrivateContentCanaries = (page: IDocsPage, pages: IDocsPage[]): string[] => {
  const shownToEveryone = [
    ...pages.filter((other) => !other.isPrivate).map((other) => other.body),
    ...pages.map((other) => other.title),
    ...listFiles(CONTENT_DIR)
      .filter((file) => file.endsWith('meta.json'))
      .map((file) => readFileSync(file, 'utf8')),
  ].join('\n')

  return toProseLines(page.body).filter((line) => !shownToEveryone.includes(line))
}

