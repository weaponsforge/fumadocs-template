import { decodePathname } from '@/lib/utils'

import {
  DOCS_ROUTE_SEGMENT,
  LLMS_MDX_ROUTE_SEGMENT,
  OG_ROUTE_SG,
} from './routes'
import { PRIVATE_PAGES, PUBLIC_EXCEPTIONS } from './routes'

// Routes decode at most 2 percent-encoded layers, so real paths settle well before this cap.
// A path still encoded after it throws and is treated as private.
const MAX_DECODE_PASSES = 5

/**
 * @class RouteUtil
 * @description Utilities for managing docs routes
 */
export default class RouteUtil {
  PRIVATE_ROUTES: string[] = []

  constructor (privateRoutes: string[]) {
    this.PRIVATE_ROUTES = privateRoutes
  }

  /**
   * Maps any representation of a path to its canonical, decoded `/docs/...` form,
   * so exceptions and private checks only need to be written once.
   * @param {string} route - url route, possibly percent-encoded
   * @returns {string}
   * @throws {URIError} On malformed percent-encoding
   */
  toCanonicalDocsPath (route: string): string {
    const pathname = decodePathname({
      pathname: route,
      maxDecodePasses: MAX_DECODE_PASSES,
    })

    if (pathname === `/${LLMS_MDX_ROUTE_SEGMENT}`) {
      return `/${DOCS_ROUTE_SEGMENT}`
    }

    if (pathname.startsWith(`/${LLMS_MDX_ROUTE_SEGMENT}/`)) {
      const subRoute = pathname
        .slice(`/${LLMS_MDX_ROUTE_SEGMENT}/`.length)
        .replace(/\.mdx$/, '')

      return `/${DOCS_ROUTE_SEGMENT}/${subRoute}`
    }

    // OG images, eg. /og/secrets/map/image.webp → /docs/secrets/map
    if (pathname.startsWith(`/${OG_ROUTE_SG}/`)) {
      const subRoute = pathname
        .slice(`/${OG_ROUTE_SG}/`.length)
        .split('/')
        .slice(0, -1)
        .join('/')

      return subRoute
        ? `/${DOCS_ROUTE_SEGMENT}/${subRoute}`
        : `/${DOCS_ROUTE_SEGMENT}`
    }

    return pathname.replace(/\.mdx$/, '')
  }

  /**
   * Public sub routes under private routes are an exception
   * @param pathname - Route
   * @returns {boolean}
   */
  isPublicException (pathname: string): boolean {
    return PUBLIC_EXCEPTIONS.includes(this.toCanonicalDocsPath(pathname))
  }

  /**
   * Single private pages outside the private routes, eg. a private page in a public section
   * @param pathname - Route
   * @returns {boolean}
   */
  isPrivatePage (pathname: string): boolean {
    return PRIVATE_PAGES.includes(this.toCanonicalDocsPath(pathname))
  }

  /**
   * Returns `true` if a route has private access.
   * Returns `false` if a page has public access
   * @param {string} route - Route or path to a page resource.
   *    Can start with `"/docs"` or `"/llms.mdx"`, and may be percent-encoded.
   *    Malformed encoding is treated as private.
   * @returns {boolean}
   */
  isPrivateRoute (route: string) {
    let cannonicalPath: string

    try {
      cannonicalPath = this.toCanonicalDocsPath(route)
    } catch {
      // Fail closed: a path that can't be decoded can't be proven public
      return true
    }

    const isUnderPrivateRoute =
      !this.isPublicException(route) &&
      this.PRIVATE_ROUTES.some(prefix =>
        cannonicalPath === prefix || cannonicalPath.startsWith(`${prefix}/`),
      )

    const isPrivate = isUnderPrivateRoute || this.isPrivatePage(route)

    return isPrivate
  }
}
