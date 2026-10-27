import { describe, expect, it, vi } from 'vitest'

import { PRIVATE_ROUTES, RouteHandler } from '@/lib/routes'

import type { IDocsRoutes } from 'fumadocs-routes'

// Use fixed privacy lists, so the tests don't depend on the current content/docs/.
vi.mock('collections/docs-routes.json', () => ({
  default: {
    sections: ['characters', 'secrets', 'stats-calculator', 'weapons'],
    section_labels: {},
    private_sections: ['characters/hidden', 'secrets', 'stats-calculator'],
    public_exceptions: ['characters/hidden/faq', 'secrets', 'secrets/skill-tips'],
    private_pages: ['characters/elf'],
  } satisfies IDocsRoutes,
}))

describe('PRIVATE_ROUTES', () => {
  it('expands each private section into its /docs, .mdx and /llms.mdx forms', () => {
    expect(PRIVATE_ROUTES).toEqual([
      '/docs/characters/hidden',
      '/docs/characters/hidden.mdx',
      '/llms.mdx/characters/hidden',
      '/docs/secrets',
      '/docs/secrets.mdx',
      '/llms.mdx/secrets',
      '/docs/stats-calculator',
      '/docs/stats-calculator.mdx',
      '/llms.mdx/stats-calculator',
    ])
  })
})

describe('RouteUtil.toCanonicalDocsPath', () => {
  it.each([
    ['/docs/secrets/map', '/docs/secrets/map'],
    ['/docs/secrets/map.mdx', '/docs/secrets/map'],
    ['/llms.mdx', '/docs'],
    ['/llms.mdx/secrets/map', '/docs/secrets/map'],
    ['/llms.mdx/secrets/map.mdx', '/docs/secrets/map'],
    ['/og/secrets/map/image.webp', '/docs/secrets/map'],
    ['/og/image.webp', '/docs'],
    ['/docs/s%65crets/map', '/docs/secrets/map'],
    ['/docs/secrets%2Fmap', '/docs/secrets/map'],
    ['/docs/s%2565crets/map', '/docs/secrets/map'],
    ['/docs/secrets/map.md%78', '/docs/secrets/map'],
    ['/llms.mdx/s%65crets/map', '/docs/secrets/map'],
    ['/og/%73ecrets/map/image.webp', '/docs/secrets/map'],
  ])('maps %s to %s', (pathname, expected) => {
    expect(RouteHandler.toCanonicalDocsPath(pathname)).toBe(expected)
  })

  it.each([
    '/docs/%',
    '/docs/secrets/%E0%A4%A',
    `/docs/%${'25'.repeat(5)}73ecrets`,
  ])('throws a URIError for %s', (pathname) => {
    expect(() => RouteHandler.toCanonicalDocsPath(pathname)).toThrow(URIError)
  })
})

describe('RouteUtil.isPrivateRoute', () => {
  describe('private sections', () => {
    it.each([
      '/docs/secrets/map',
      '/docs/secrets/map.mdx',
      '/llms.mdx/secrets/map',
      '/og/secrets/map/image.webp',
      '/docs/stats-calculator',
      '/docs/stats-calculator.mdx',
      '/llms.mdx/stats-calculator',
      '/docs/stats-calculator/wizard',
      '/og/stats-calculator/wizard/image.webp',
    ])('%s is private', (route) => {
      expect(RouteHandler.isPrivateRoute(route)).toBe(true)
    })

    it('matches whole path segments, not string prefixes', () => {
      expect(RouteHandler.isPrivateRoute('/docs/secretsx')).toBe(false)
      expect(RouteHandler.isPrivateRoute('/docs/stats-calculator-v2')).toBe(false)
    })
  })

  describe('public exceptions inside a private section', () => {
    it.each([
      '/docs/secrets',
      '/docs/secrets.mdx',
      '/llms.mdx/secrets',
      '/og/secrets/image.webp',
      '/docs/secrets/skill-tips',
      '/docs/secrets/skill-tips.mdx',
      '/llms.mdx/secrets/skill-tips',
      '/og/secrets/skill-tips/image.webp',
    ])('%s is public', (route) => {
      expect(RouteHandler.isPrivateRoute(route)).toBe(false)
    })

    it('does not extend an exception to the pages under it', () => {
      expect(RouteHandler.isPrivateRoute('/docs/secrets/skill-tips/advanced')).toBe(true)
    })
  })

  describe('private folder nested in a public section', () => {
    it.each([
      '/docs/characters/hidden',
      '/docs/characters/hidden.mdx',
      '/llms.mdx/characters/hidden',
      '/docs/characters/hidden/boss',
      '/docs/characters/hidden/boss.mdx',
      '/llms.mdx/characters/hidden/boss',
      '/og/characters/hidden/boss/image.webp',
    ])('%s is private', (route) => {
      expect(RouteHandler.isPrivateRoute(route)).toBe(true)
    })

    it.each([
      '/docs/characters/hidden/faq',
      '/llms.mdx/characters/hidden/faq',
      '/og/characters/hidden/faq/image.webp',
    ])('public exception %s is public', (route) => {
      expect(RouteHandler.isPrivateRoute(route)).toBe(false)
    })

    it('leaves the rest of the parent section public', () => {
      expect(RouteHandler.isPrivateRoute('/docs/characters')).toBe(false)
      expect(RouteHandler.isPrivateRoute('/docs/characters/knight')).toBe(false)
      expect(RouteHandler.isPrivateRoute('/docs/characters/hiddenx')).toBe(false)
    })
  })

  describe('private pages in a public section', () => {
    it.each([
      '/docs/characters/elf',
      '/docs/characters/elf.mdx',
      '/llms.mdx/characters/elf',
      '/og/characters/elf/image.webp',
    ])('%s is private', (route) => {
      expect(RouteHandler.isPrivateRoute(route)).toBe(true)
    })

    it('only matches the exact page', () => {
      expect(RouteHandler.isPrivateRoute('/docs/characters/elf-guide')).toBe(false)
      expect(RouteHandler.isPrivateRoute('/docs/characters')).toBe(false)
    })
  })

  describe('percent-encoded paths', () => {
    // Routes behind the proxy decode these to the plain path (the /og and /llms.mdx
    // handlers decode two layers and %2F), so they must match like it
    it.each([
      '/docs/s%65crets/map',
      '/docs/%73tats-calculator',
      '/docs/characters/el%66',
      '/docs/characters%2Felf',
      '/docs/characters/hidde%6E/boss',
      '/docs/s%2565crets/map',
      '/docs/secrets/map.md%78',
      '/llms.mdx/s%65crets/map',
      '/og/%73ecrets/map/image.webp',
    ])('%s is private', (route) => {
      expect(RouteHandler.isPrivateRoute(route)).toBe(true)
    })

    it.each([
      '/docs/s%65crets',
      '/docs/secrets/skill-tip%73',
      '/docs/w%65apons',
    ])('%s stays public', (route) => {
      expect(RouteHandler.isPrivateRoute(route)).toBe(false)
    })

    it.each([
      '/docs/%',
      '/docs/weapons/%E0%A4%A',
      `/docs/weapons/%${'25'.repeat(5)}73word`,
    ])('treats undecodable %s as private', (route) => {
      expect(RouteHandler.isPrivateRoute(route)).toBe(true)
    })
  })

  describe('public routes', () => {
    it.each([
      '/',
      '/docs',
      '/llms.mdx',
      '/docs/characters/dark-knight',
      '/docs/weapons',
      '/llms.mdx/weapons',
      '/auth/signin',
    ])('%s is public', (route) => {
      expect(RouteHandler.isPrivateRoute(route)).toBe(false)
    })
  })
})
