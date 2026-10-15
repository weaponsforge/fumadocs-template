import { update } from 'fumadocs-core/source'

import { docs } from 'collections/server'

import { cleanSourceRoute } from '@/lib/utils'

import { RouteHandler } from './routes'

type IDocsSubset =
  | {
      excludedRoutes: string[]
      includedRoutes?: never
    }
  | {
      includedRoutes: string[]
      excludedRoutes?: never
    }

interface IBuildCustomSource {
  isPrivate?: boolean;
  subset?: IDocsSubset;
}

/**
 * Builds the docs source by filtering the `excludedRoutes` or `includedRoutes` docs subsets.
 * Builds only the private or public docs content on the `isPrivate` flag if the `subset` paramater is absent.
 * @param {boolean} isPrivate Flag to build only private auth-gated content. Builds the content if `false` and `subset` is absent.
 * @param {IDocsSubset} subset Object containing subsets to include/exclude from the docs build. If absent, builds the public content docs by default.
 * @param {string[]} subset.excludedRoutes list of docs routes to exclude, eg., `/docs/secrets`
 * @param {string[]} subset.includedRoutes list of docs routes to include, all else are excluded.
 * @returns Fumadocs `Source`
 */
export const buildCustomSource = ({
  isPrivate = false,
  subset,
}: IBuildCustomSource) => {
  const hasExcluded = Array.isArray(subset?.excludedRoutes)
  const hasIncluded = Array.isArray(subset?.includedRoutes)

  if (subset && hasExcluded === hasIncluded) {
    throw new Error('Exactly 1 of excludedRoutes[] or includedRoutes[] must be provided')
  }

  const cleanExcluded = subset?.excludedRoutes?.map(cleanSourceRoute) ?? []
  const cleanIncluded = subset?.includedRoutes?.map(cleanSourceRoute) ?? []

  return update(docs.toFumadocsSource())
    .files((files) =>
      files.filter((file) => {
        const fullPath = file?.data?.info?.fullPath
        if (!fullPath) return true

        const cleanFilePath = cleanSourceRoute(
          fullPath.replaceAll('\\', '/'),
        )

        if (subset) {
          // Extract the defined included/excluded subset
          return hasExcluded
            ? cleanExcluded.every((route) => !cleanFilePath.includes(route))
            : cleanIncluded.every((route) => cleanFilePath.includes(route))
        }

        // Extract private/public items
        const normalRoute = cleanFilePath.replace(/^\/content|\.[^.\/]+$/g, '')

        return isPrivate
          ? RouteHandler.isPrivateRoute(normalRoute)
          : !RouteHandler.isPrivateRoute(normalRoute)
      }),
    )
    .build()
}
