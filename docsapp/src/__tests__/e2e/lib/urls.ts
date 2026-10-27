import { relative, sep } from 'node:path'

import {
  BASE_URL,
  CONTENT_DIR,
} from './constants'

interface IRequestVariant {
  name: string
  path: string
  headers?: Record<string, string>
}

/**
 * Maps an .mdx or .md file to its docs URL: `(group)` folders and `index` add no segment
 */
export const toDocsUrl = (file: string) => {
  const slug = relative(CONTENT_DIR, file)
    .split(sep)
    .filter((segment) => !/^\(.+\)$/.test(segment))
    .join('/')
    .replace(/\.mdx?$/, '')
    .replace(/(^|\/)index$/, '')

  return slug ? `/docs/${slug}` : '/docs'
}

/**
 * Reduces a link to its canonical docs page URL
 */
export const toPageUrl = (link: string) => {
  return new URL(link, BASE_URL).pathname
    .replace(/\.mdx$/, '')
    .replace(/(.)\/$/, '$1')
}

/**
 * Every representation of a docs page the app serves
 */
export const toVariants = (url: string): IRequestVariant[] => {
  const slug = url.replace(/^\/docs/, '')

  return [
    { name: 'HTML page', path: url },
    { name: '.mdx', path: `${url}.mdx` },
    { name: 'Accept: text/markdown', path: url, headers: { accept: 'text/markdown' } },
    { name: '/llms.mdx', path: `/llms.mdx${slug}` },
    { name: 'OG image', path: `/og${slug}/image.webp` },
    { name: 'RSC payload', path: url, headers: { rsc: '1' } },
  ]
}

const percentEncodeCharAt = (path: string, index: number) => {
  return `${path.slice(0, index)}%${path.charCodeAt(index).toString(16).toUpperCase()}${path.slice(index + 1)}`
}

/**
 * Alternative spellings of a page URL that a browser or Next.js may resolve
 * to the same page, but a naive path check would not recognize as private
 */
export const toPathProbes = (url: string) => {
  const slug = url.replace(/^\/docs\//, '')
  const lastSlash = slug.lastIndexOf('/')
  const encodedFirstChar = percentEncodeCharAt(slug, 0)
  const toPageAndOgImage = (slugSpelling: string) => [
    `/docs/${slugSpelling}`,
    `/og/${slugSpelling}/image.webp`,
  ]

  return [
    `${url}/`,
    `/docs//${slug}`,
    percentEncodeCharAt(url, url.length - 1),
    ...toPageAndOgImage(encodedFirstChar),
    // Double-encoded: the /og and /llms.mdx route handlers decode two layers
    ...toPageAndOgImage(encodedFirstChar.replace('%', '%25')),
    // Encoded slash between slug segments, which the route handlers also decode
    ...(lastSlash === -1
      ? []
      : toPageAndOgImage(`${slug.slice(0, lastSlash)}%2F${slug.slice(lastSlash + 1)}`)),
  ]
}
