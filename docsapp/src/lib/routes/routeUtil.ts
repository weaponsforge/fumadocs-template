import {
  DOCS_ROUTE_SEGMENT,
  LLMS_MDX_ROUTE_SEGMENT,
} from './routes'
import { PUBLIC_EXCEPTIONS } from './routes'

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
   * Maps any representation of a path to its canonical `/docs/...` form,
   * so exceptions and private checks only need to be written once.
   * @param {string} pathname - url route
   * @returns {string}
   */
  toCanonicalDocsPath (pathname: string): string {
    if (pathname === `/${LLMS_MDX_ROUTE_SEGMENT}`) {
      return `/${DOCS_ROUTE_SEGMENT}`
    }

    if (pathname.startsWith(`/${LLMS_MDX_ROUTE_SEGMENT}/`)) {
      const subRoute = pathname.slice(`/${LLMS_MDX_ROUTE_SEGMENT}/`.length).replace(/\.mdx$/, '')

      return `/${DOCS_ROUTE_SEGMENT}/${subRoute}`
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
   * Returns `true` if a route has public access.
   * Returns `false` if a page has private access
   * @param {string} route - Route or path to a page resource.
   *    Can start with `"/docs"` or `"/llms.mdx"`
   * @returns {boolean}
   */
  isPrivateRoute (route: string) {
    const cannonicalPath = this.toCanonicalDocsPath(route)

    const isPrivate =
      !this.isPublicException(route) &&
      this.PRIVATE_ROUTES.some(prefix =>
        cannonicalPath === prefix || cannonicalPath.startsWith(`${prefix}/`),
      )

    return isPrivate
  }
}
