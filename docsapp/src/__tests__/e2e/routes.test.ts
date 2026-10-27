import { describe, expect, it } from 'vitest'

import {
  getPrivateContentCanaries,
  getDocsPages,
  getProtectedAssetUrls,
  toProseLines,
} from './lib/oracle'
import {
  request,
  getSignInCallback,
  requestFollowingRedirects,
} from './lib/services'
import {
  toPageUrl,
  toPathProbes,
  toVariants,
} from './lib/urls'

// Runs against a "local" production build with Google OAuth configured (see setup.ts) and
// no session: no private docs content may be served, in any representation.
// Private titles, URLs and descriptions are public metadata (see docs/AUTHENTICATION.md)
// and not checked.

const pages = getDocsPages()
const privatePages = pages.filter((page) => page.isPrivate)
const publicPages = pages.filter((page) => !page.isPrivate)
const privateUrls = new Set(privatePages.map((page) => page.url))
const canaries = privatePages.flatMap((page) => getPrivateContentCanaries(page, pages))

const FORGED_SESSION = { cookie: 'better-auth.session_token=forged.privacy-session-token' }

const search = async (query: string) => {
  const apiSearchURL = `/api/search?query=${encodeURIComponent(query)}`
  const res = await request(apiSearchURL)

  expect(res.status).toBe(200)

  const results: { url: string }[] = await res.json()

  return results.map((result) => toPageUrl(result.url))
}

const getText = async (path: string) => {
  const res = await request(path)

  expect(res.status).toBe(200)

  return await res.text()
}

describe('content', () => {
  it('has private and public docs to check', () => {
    expect(privatePages.length).toBeGreaterThan(0)
    expect(publicPages.length).toBeGreaterThan(0)
  })
})

describe('public docs (control)', () => {
  describe.each(publicPages)('$url', ({ url }) => {
    it.each(toVariants(url))('serves the $name', async ({ path, headers }) => {
      const res = await requestFollowingRedirects(path, headers)

      expect(res.status).toBe(200)
    })
  })
})

describe('private docs without a session', () => {
  describe.each(privatePages)('$url', ({ url }) => {
    it.each(toVariants(url))('redirects the $name to sign-in', async ({ path, headers }) => {
      const res = await requestFollowingRedirects(path, headers)

      expect({ status: res.status, callbackURL: getSignInCallback(res) })
        .toEqual({ status: 307, callbackURL: path })
    })

    it('redirects to sign-in with a forged session cookie', async () => {
      const res = await request(url, FORGED_SESSION)

      expect({ status: res.status, callbackURL: getSignInCallback(res) })
        .toEqual({ status: 307, callbackURL: url })
    })

    it.each(toPathProbes(url))('does not serve the page at %s', async (path) => {
      const res = await requestFollowingRedirects(path)
      const isBlocked = getSignInCallback(res) !== null || res.status === 404

      expect(isBlocked, `${path} responded ${res.status}`).toBe(true)
    })
  })
})

describe('/llms.txt', () => {
  it('lists no private docs', async () => {
    const text = await getText('/llms.txt')
    const links = [...text.matchAll(/\]\(([^)\s]+)\)/g)].map(([, link]) => toPageUrl(link))

    expect(links.length).toBeGreaterThan(0)
    expect(links.filter((link) => privateUrls.has(link))).toEqual([])
  })
})

describe('/llms-full.txt', () => {
  it('includes every public page (control)', async () => {
    const text = await getText('/llms-full.txt')
    const publicProse = publicPages.flatMap((page) => toProseLines(page.body))

    for (const page of publicPages) {
      expect(text).toContain(`URL: ${page.url}\n`)
    }

    // Canaries are matched verbatim, so prove that prose survives into the output
    expect(publicProse.some((line) => text.includes(line))).toBe(true)
  })

  it('includes no private docs', async () => {
    const text = await getText('/llms-full.txt')
    const urls = [...text.matchAll(/^\s*URL: (\S+)\s*$/gm)].map(([, link]) => toPageUrl(link))

    expect(urls.filter((link) => privateUrls.has(link))).toEqual([])
    expect(canaries.filter((canary) => text.includes(canary))).toEqual([])
  })
})

describe('/api/search', () => {
  it.each(publicPages)('finds public page $url by its title (control)', async ({ url, title }) => {
    expect(await search(title)).toContain(url)
  })

  describe.each(privatePages)('$url', (page) => {
    it.each([page.title, ...getPrivateContentCanaries(page, pages)])('returns no private docs for %j', async (query) => {
      const results = await search(query)

      expect(results.filter((result) => privateUrls.has(result))).toEqual([])
    })
  })
})

describe('public pages', () => {
  it.each(publicPages)('$url contains no private page content', async ({ url }) => {
    const html = await getText(url)

    expect(canaries.filter((canary) => html.includes(canary))).toEqual([])
  })
})

describe('protected assets without a session', () => {
  it('has protected assets to check', () => {
    expect(getProtectedAssetUrls().length).toBeGreaterThan(0)
  })

  it.each(getProtectedAssetUrls())('%s responds 401', async (path) => {
    expect((await request(path)).status).toBe(401)
    expect((await request(path, FORGED_SESSION)).status).toBe(401)
  })
})
